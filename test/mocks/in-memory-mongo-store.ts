import { connect, Mongoose as M } from 'mongoose';
import { Mongoose } from '../../src/storage';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class InMemoryMongoStore extends Mongoose.MongoStore {
  constructor() {
    super();
  }

  public async connect(): Promise<M> {
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    console.log('DB initiadted');

    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };

    return connect(uri, options);
  }
}
