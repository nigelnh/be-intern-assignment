import Joi from 'joi';

export const createLikeSchema = Joi.object({
  userId: Joi.number().required().messages({
    'number.base': 'User ID must be a number',
    'any.required': 'User ID is required',
  }),
  postId: Joi.number().required().messages({
    'number.base': 'Post ID must be a number',
    'any.required': 'Post ID is required',
  }),
});

export const deleteLikeSchema = Joi.object({
  userId: Joi.number().required().messages({
    'number.base': 'User ID must be a number',
    'any.required': 'User ID is required',
  }),
  postId: Joi.number().required().messages({
    'number.base': 'Post ID must be a number',
    'any.required': 'Post ID is required',
  }),
});
