import lodash from 'lodash';
import { check, ValidationChain } from 'express-validator';
import { AppContext } from '@typings';

const deleteTodoValidator = (appContext: AppContext): ValidationChain[] => [
  check('id', 'The specified todo ID is not a valid one. Please provide a valid one.').isMongoId(),
  check('id')
    .custom(async id => {
      const deleteItem = await appContext.todoRepository.findOne({
        _id: id,
      });
      if (lodash.isEmpty(deleteItem)) {
        return Promise.reject();
      }
    })
    .withMessage('The specified todo ID is not a valid one. Please provide a valid one.'),
];

export default deleteTodoValidator;
