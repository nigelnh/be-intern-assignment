# Design Document for Social Media Platform

## Database Schema and Entity Relationships

### Entities and Relationships

1. **User**

   - Properties: id, firstName, lastName, email, createdAt, updatedAt
   - Relationships:
     - One-to-Many with Post (author)
     - One-to-Many with Like (user)
     - One-to-Many with Follow (as follower)
     - One-to-Many with Follow (as following)

2. **Post**

   - Properties: id, content, authorId, createdAt, updatedAt
   - Relationships:
     - Many-to-One with User (author)
     - One-to-Many with Like
     - Many-to-Many with Hashtag

3. **Like**

   - Properties: id, userId, postId, createdAt
   - Relationships:
     - Many-to-One with User
     - Many-to-One with Post

4. **Follow**

   - Properties: id, followerId, followingId, createdAt
   - Relationships:
     - Many-to-One with User (follower)
     - Many-to-One with User (following)

5. **Hashtag**
   - Properties: id, name, createdAt, updatedAt
   - Relationships:
     - Many-to-Many with Post

### Database Diagram (ER Diagram)

```
User 1 --- * Post
User 1 --- * Like
User 1 --- * Follow (as follower)
User 1 --- * Follow (as following)
Post 1 --- * Like
Post * --- * Hashtag
```

## Indexing Strategy for Performance Optimization

To ensure optimal query performance, the following indexes have been implemented:

1. **Primary Keys**

   - All entities have a primary key `id` which is auto-incremented.

2. **Unique Indexes**

   - `User.email` - To ensure email uniqueness
   - `Hashtag.name` - To ensure hashtag names are unique
   - `Like(userId, postId)` - Composite index to ensure a user can like a post only once
   - `Follow(followerId, followingId)` - Composite index to ensure a follower can follow another user only once

3. **Foreign Keys**

   - `Post.authorId` -> `User.id`
   - `Like.userId` -> `User.id`
   - `Like.postId` -> `Post.id`
   - `Follow.followerId` -> `User.id`
   - `Follow.followingId` -> `User.id`
   - `post_hashtags.postId` -> `Post.id`
   - `post_hashtags.hashtagId` -> `Hashtag.id`

4. **Index Rationale**
   - For the `/api/feed` endpoint, we indexed `Post.authorId` to quickly retrieve posts from followed users.
   - For the `/api/posts/hashtag/:tag` endpoint, we indexed `Hashtag.name` for case-insensitive quick lookups.
   - For the `/api/users/:id/followers` endpoint, we indexed `Follow.followingId` to efficiently find followers.
   - For the `/api/users/:id/activity` endpoint, we ensured indexes on userId/followerId fields for quick filtering.

## Scalability Considerations

1. **Pagination**

   - All list endpoints support pagination with `limit` and `offset` parameters.
   - This prevents overloading the server with large result sets.

2. **Efficient Joins**

   - Used selective joins to fetch only the necessary related data.
   - For example, when fetching a post, we join author, likes, and hashtags.

3. **Composite Indexes**

   - Used composite indexes for frequently queried combinations.
   - Example: `(userId, postId)` for likes, `(followerId, followingId)` for follows.

4. **Query Optimization**

   - Used TypeORM's query builder to create efficient SQL queries.
   - Example: In the feed endpoint, we query posts directly with an `IN` clause for author IDs.

5. **Data Transfer Optimization**
   - Selective response properties to minimize payload size.
   - Example: In the feed endpoint, we transform post data to include only necessary fields.

## API Design Decisions

1. **RESTful Approach**

   - Used standard HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.
   - Structured URLs follow RESTful conventions (e.g., `/api/users/:id`).

2. **Validation**

   - Implemented Joi validation schemas for request data.
   - Validation happens at the middleware level before reaching controllers.

3. **Error Handling**

   - Consistent error response format across all endpoints.
   - HTTP status codes match the nature of errors (404 for not found, 400 for bad request, etc.).

4. **Special Endpoints**
   - `/api/feed` - Personalized content stream with pagination
   - `/api/posts/hashtag/:tag` - Find posts by hashtag with case-insensitive matching
   - `/api/users/:id/followers` - Get user's followers with pagination
   - `/api/users/:id/activity` - View user activity history with filtering options

## Additional Design Considerations

1. **Cascading Deletes**

   - Foreign key constraints with CASCADE delete for related entities.
   - Example: When a post is deleted, all related likes are automatically deleted.

2. **Timestamps**

   - All entities include creation timestamps.
   - Most entities include update timestamps for tracking changes.

3. **Case Sensitivity**

   - Hashtag search is case-insensitive to improve user experience.
   - Hashtags are stored in lowercase to ensure consistent matching.

4. **Filtering and Sorting**
   - Activity endpoint supports filtering by type and date range.
   - Results are sorted by recency (newest first) for better user experience.

## Security Considerations

1. **Input Validation**

   - All user inputs are validated using Joi schemas.
   - Prevents malformed data and potential injection attacks.

2. **Foreign Key Constraints**

   - Ensures referential integrity in the database.
   - Prevents orphaned records if parent entities are deleted.

3. **Error Message Security**
   - Error messages provide enough detail for debugging without exposing system details.
   - Production would benefit from more generic error messages.
