Posts
=======

## actions.js
Flux action creators related to posts

## posts-store.js
Contains post objects returned from the REST API that are formatted for display indexed by `global_ID`.

## post-list-store.js
Contains state for an active posts query with pagination.

## post-list-cache-store.js
Caches lists hashed by query. When a new active query is set with the `queryPosts` action, `post-list-store` checks for a cached active list to use before creating a new one.

## post-counts-store.js
Keeps track of the number of posts in the active site (a part of the active query) for an authorship scope ('all' or 'mine') and status ('draft', 'publish' etc.).
Example: `PostCountsStore.get(siteId, 'all')` would return an object like this:
```js
{
  "draft": 9
  "publish": 677
  "trash": 9
}
```

## post-content-images-store.js
Stores post images hashed by post id.
`PostContentImagesStore.getAll()` would return an object like this:
```js
{
  "7830aeb03d8a434d1ef2afc837c6ae81": {
    "content_images": [...],
    "featured_image": "...",
    "images": [...]
  },
  "8ffa7f3c644b149c4dbb8b86a411f52d": {...}
}
```

## post-edit-store.js
Keeps track of the post that is currently being edited.
