import { BaseController } from './base-controller';
import { NextFunction, Response, Router } from 'express';
import { Validation } from '@helpers';
import {
  createTodoValidator,
  deleteTodoValidator,
  updateTodoItemValidator,
  fetchTodoValidator,
} from '@validators';
import { TodoItem } from '@models';
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';

export class TodoController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.basePath}`,
      createTodoValidator(this.appContext),
      this.createTodo
    );
    this.router.delete(
      `${this.basePath}/:id`,
      deleteTodoValidator(this.appContext),
      this.deleteTodo
    );
    this.router.put(
      `${this.basePath}/:id`,
      updateTodoItemValidator(this.appContext),
      this.updateTodo
    );
    this.router.get(
      `${this.basePath}/:id`,
      fetchTodoValidator(this.appContext),
      this.fetchTodo
    );
  }

  private createTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const failures: ValidationFailure[] =
      Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures
      );
      return next(valError);
    }

    const { title } = req.body;
    const todo = await this.appContext.todoRepository.save(
      new TodoItem({ title })
    );
    res.status(201).send(todo.serialize());
  };

  private deleteTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const failures: ValidationFailure[] =
      Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures
      );
      return next(valError);
    }

    const { iden } = req.params;
    const deleteTodo = await this.appContext.todoRepository.deleteMany({
      id: iden,
    });
    res.status(204).send(deleteTodo);
  };
  private updateTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const failures: ValidationFailure[] =
      Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures
      );
      return next(valError);
    }
    const { id } = req.params;
    const { title } = req.body;
    const todo = await this.appContext.todoRepository.update(
      {_id: id},
      { $set: { title } }
    );
    if (todo?._id) {
      res.status(200).json(todo.serialize());
    } else {
      const valError = new Errors.NotFoundError(
        res.__('DEFAULT_ERRORS.RESOURCE_NOT_FOUND')
      );
      return next(valError);
    }
  };

  private fetchTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }
    const { id } = req.params;
    const todo = await this.appContext.todoRepository.findOne({ _id: id });
    if (todo._id) {
      res.status(200).json(todo.serialize());
    } else {
      const valError = new Errors.NotFoundError(
        res.__("DEFAULT_ERRORS.VALIDATION_FAILED")
      );
      next(valError);
    }
  };
}
