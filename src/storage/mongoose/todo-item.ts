import { model, Schema } from 'mongoose';
const todo_Schema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'todoItems',
  }
);

const todoItem = model('TodoItem', todo_Schema);

export default todoItem;
