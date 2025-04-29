import Joi from 'joi';

export const createFollowSchema = Joi.object({
  followerId: Joi.number().required().messages({
    'number.base': 'Follower ID must be a number',
    'any.required': 'Follower ID is required',
  }),
  followingId: Joi.number().required().messages({
    'number.base': 'Following ID must be a number',
    'any.required': 'Following ID is required',
  }),
});

export const deleteFollowSchema = Joi.object({
  followerId: Joi.number().required().messages({
    'number.base': 'Follower ID must be a number',
    'any.required': 'Follower ID is required',
  }),
  followingId: Joi.number().required().messages({
    'number.base': 'Following ID must be a number',
    'any.required': 'Following ID is required',
  }),
});
