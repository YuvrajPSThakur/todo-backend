require ('module-alias/register');
import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { TodoItem } from '../../../src/models';
import { App } from '../../../src/server';
import { respositoryContext, testAppContext } from '../../mocks/app-context';


chai.use(chaiHttp);
const expect = chai.expect;
let expressApp: Application;

before(async () => {
  //await respositoryContext.store.connect();
  const app = new App(testAppContext);
  

  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();

  expressApp = app.expressApp;
});

describe('POST /todo', () => {
  it('should create a new todo item', async () => {
    const res = await chai.request(expressApp).post('/todos').send({
      title: 'Todo Item',
    });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
  });

  it('should not allow blank title', async () => {
    const res = await chai.request(expressApp).post('/todos').send({
      title: '',
    });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message');
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('VALIDATION_ERRORS.INVALID_TITLE');
  });

  it('should not allow duplicate title', async () => {
    await testAppContext.todoRepository.save(
      new TodoItem({
        title: 'Duplicate Check Todo Item',
      })
    );

    const res = await chai.request(expressApp).post('/todos').send({
      title: 'Duplicate Check Todo Item',
    });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message');
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('VALIDATION_ERRORS.DUPLICATE_ENTRY');
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a todo item if it exists and if ID it is valid.', async () => {
    const todoItem = await testAppContext.todoRepository.save(
      new TodoItem({ title: 'Title to be deleted' })
    );
    const res = await chai.request(expressApp).delete(`/todos/${todoItem._id}`);

    expect(res).to.have.status(204);
  });

  it('should return a validation error if id is not a valid ID.', async () => {
    const res = await chai.request(expressApp).delete('/todos/2114071');

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal(
        'The specified todo ID is not a valid one. Please provide a valid one.'
      );
  });
});
describe('PUT /todos/:id', () => {
  it('should return 200 if todo exists & id is valid mongo id & title is not empty', async () => {
    const todoItem = await testAppContext.todoRepository.save(
      new TodoItem({title: 'Todo Item Added'})
    );
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todoItem._id}`)
      .send({
        title: 'To update',
      });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
  })

  it('should return 400 if todo exists & id is valid mongo id & title is empty', async () => {
    const todoItem = await testAppContext.todoRepository.save(
      new TodoItem({title: 'Todo Item Added'})
    );
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todoItem._id}`)
      .send({
        title: '',
      });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('VALIDATION_ERRORS.INVALID_TITLE');
  })

  it('should return 400 if id is invalid mongo id', async () => {
    const res = await chai
      .request(expressApp)
      .put(`/todos/hdjkfffm8efe`)
      .send({
        title: 'id not valid',
      });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('VALIDATION_ERRORS.INVALID_ID');
  });

  it('should return 404 if todo item not found', async () => {
    const res = await chai
      .request(expressApp)
      .put(`/todos/60e6a930d1df5518e185ba05`)
      .send({
        title: 'id not valid',
      });
    expect(res).to.have.status(404);
  });
});


describe("GET /todos/:id", () => {
  it("should fetch a todo item if it exists and if id is valid mongo id", async () => {
    const todoItem = await testAppContext.todoRepository.save(
      new TodoItem({ title: "Fetching an item" })
    );

    const res = await chai.request(expressApp).get(`/todos/${todoItem._id}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });

  it("Should return a validation error if id is invalid mongo id", async () => {
    const res = await chai.request(expressApp).get("/todos/befji47crhjehr");
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal("VALIDATION_ERRORS.INVALID_ID");
  });

  it("should return a 404 if todo item does not exists", async () => {
    const res = await chai
      .request(expressApp)
      .get("/todos/605bb3efc93d78b7f4388c2c");

    expect(res).to.have.status(404);
  });
});

describe("GET /todos", () => {
  it("should have got all the todo items", async () => {
    const res = await chai.request(expressApp).get("/todos");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
  });

  it("should check if the array returned is empty when there are no todo items", async () => {
    await testAppContext.todoRepository.getAll();

    await testAppContext.todoRepository.deleteMany({});

    const res = await chai.request(expressApp).get("/todos");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.deep.equal([]);
  });
});



