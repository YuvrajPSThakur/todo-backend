import { BaseController } from '@controllers';
import { Validation } from '@helpers';
import { NextFunction, Router, response } from 'express';
import { createTodoValidator } from '@validators';
import { TodoItem } from '@models';
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';
import { Response } from 'express-serve-static-core';

export class TodoController extends BaseController {
  public todoRoute: String = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `/todos`,
      createTodoValidator(this.appContext),
      this.createTodo
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
    const todo = await this.appContext.todoRepository.save(
        new TodoItem(req.body)
      )
      res.status(201).send(todo.title);
    }
  };

