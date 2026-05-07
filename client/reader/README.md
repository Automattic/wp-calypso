# Reader

The Reader module handles the view and routing logic for the _Reader_ section of Calypso.

These routes are served by the module:

## Routes

### Main routes

| Route                                | Description                                             |
| ------------------------------------ | ------------------------------------------------------- |
| `/reader`                            | Main stream (followed sites)                            |
| `/reader/recent/:feed_id`            | Recent stream for a specific feed                       |
| `/reader/feeds/:feed_id`             | Feed stream                                             |
| `/reader/feeds/:feed_id/posts`       | Redirects to `/reader/feeds/:feed_id`                   |
| `/reader/blogs/:blog_id`             | Site/blog stream                                        |
| `/reader/blogs/:blog_id/posts`       | Redirects to `/reader/blogs/:blog_id`                   |
| `/reader/feeds/:feed/posts/:post`    | Full post (via feed)                                    |
| `/reader/blogs/:blog_id/posts/:post` | Full post (via blog)                                    |
| `/reader/a8c`                        | Automattic employee posts                               |
| `/reader/p2`                         | P2 posts                                                |
| `/reader/search`                     | Reader search                                           |
| `/reader/notifications`              | Reader notifications                                    |
| `/reader/feeds/lookup/*`             | Feed URL lookup (redirects to `/reader/feeds/:feed_id`) |
| `/activities/likes`                  | Liked posts                                             |

### Subscriptions

| Route                                    | Description                          | Requires login |
| ---------------------------------------- | ------------------------------------ | -------------- |
| `/reader/subscriptions`                  | Site subscriptions manager           | Yes            |
| `/reader/subscriptions/comments`         | Comment subscriptions manager        | Yes            |
| `/reader/subscriptions/pending`          | Pending subscriptions                | Yes            |
| `/reader/subscriptions/:subscription_id` | Individual subscription (by ID)      | Yes            |
| `/reader/site/subscription/:blog_id`     | Individual subscription (by blog ID) | Yes            |
| `/reader/new`                            | New subscription                     | Yes            |
| `/reader/new/reddit`                     | New Reddit subscription              | Yes            |
| `/reader/new/youtube`                    | New YouTube subscription             | Yes            |
| `/reader/new/tumblr`                     | New Tumblr subscription              | Yes            |
| `/reader/new/substack`                   | New Substack subscription            | Yes            |

### Lists

| Route                                 | Description     |
| ------------------------------------- | --------------- |
| `/reader/list/new`                    | Create new list |
| `/reader/list/:user/:list`            | View list       |
| `/reader/list/:user/:list/edit`       | Edit list       |
| `/reader/list/:user/:list/edit/items` | Edit list items |
| `/reader/list/:user/:list/export`     | Export list     |
| `/reader/list/:user/:list/delete`     | Delete list     |

### Discover

| Route                   | Description                     |
| ----------------------- | ------------------------------- |
| `/discover`             | Discover (recommended content)  |
| `/discover/recommended` | Recommended content             |
| `/discover/tags`        | Featured tags                   |
| `/discover/latest`      | Latest posts                    |
| `/discover/reddit`      | Reddit content (requires login) |
| `/discover/add-new`     | Add new source (requires login) |

### Tags and conversations

| Route                       | Description          |
| --------------------------- | -------------------- |
| `/tag/:tag`                 | Tag stream           |
| `/tags`                     | Tags listing         |
| `/reader/conversations`     | Conversations stream |
| `/reader/conversations/a8c` | A8C conversations    |

### User profile

| Route                             | Description                            |
| --------------------------------- | -------------------------------------- |
| `/reader/users/:user_login`       | Profile by login                       |
| `/reader/users/:user_login/:view` | Profile with view (posts, lists, etc.) |
| `/reader/users/id/:user_id`       | Profile by ID                          |

### Legacy redirects

Many legacy `/read/*` routes redirect to Reader routes, often under `/reader/*`, but there are exceptions such as `/read/tag/:tag_name`, which redirects to `/tag/:tag_name`. Routes like `/following`, `/following/manage`, and `/recommendations` are also redirected. Locale prefixes (`/:lang/`) are supported on: `/reader`, `/reader/search`, `/tag/:tag`, `/tags`, and `/discover/*`.

## Block Rendering Development

### Testing

#### Follow a site

1. Go to `https://wordpress.com/reader/subscriptions`
2. In the "Search or enter URL to follow..." input box, enter the website where you'll be publishing
   a block
3. When your site appears in the search results, click the "Follow" button

#### Publish a post

1. Go to `https://wordpress.com/home/{your_url}`
2. Go to "Posts" on the menu to the left
3. Click on "Add New Post"
4. Populate your post with some content, and use the block that you're testing
5. Click on "Publish" to publish your post or "Update" if the post already exists

#### Test that your block renders correctly in the Reader

There's two places where your block may render.

1. Go to `https://wordpress.com/home/{your_url}`
2. Click on "Reader"
3. Check the two tabs -- "All" and the site that you followed -- to ensure that they have rendered
   your block correctly. These are at located at the URLs `https://wordpress.com/reader` and
   `https://wordpress.com/reader/feeds/{site_id}` respectively. Let's call these "Reader Previews". This
   is the first place your block may render.
4. Click into the post and ensure that the block is rendered correctly. This is located at
   `https://wordpress.com/reader/feeds/{site_id}/posts/{post_id}`. Let's call these "Reader Posts". This
   is the second place your block may render.

### Data Flow

#### Relevant files (and order of data flow)

Reader Previews

1. `client/reader/index.js`
2. `client/reader/controller.js`
3. `client/reader/following/main.jsx`
4. `client/reader/stream/index.jsx`
5. `client/reader/stream/post-lifecycle.jsx`
6. `client/reader/stream/post.jsx`
7. `client/blocks/reader-post-card/standard.jsx`
8. `client/blocks/reader-excerpt/index.jsx`

Reader Posts

1. `client/sections.js`
2. `client/reader/full-post/index.js`
3. `client/reader/full-post/controller.js`
4. `client/blocks/reader-full-post/index.jsx`
5. `client/components/post-excerpt/index.jsx`

- The last two files render the post data. It seems that the API endpoints simply return text (as a
  `excerpt` property), but also `content` which contains the rich HTML of the block. Those files also have the ability to render HTML.

#### API Endpoints Example Requests

Reader Previews

- All
  `https://public-api.wordpress.com/rest/v1.2/read/following?http_envelope=1&orderBy=date&meta=post%2Cdiscover_original_post&before=2020-08-11T15%3A00%3A00%2B00%3A00&number=7&content_width=675`

- Specific Site
  `https://public-api.wordpress.com/rest/v1.2/read/feed/108654568/posts?http_envelope=1&orderBy=date&meta=post%2Cdiscover_original_post&number=7&content_width=675`

Reader Posts

- Specific Post
  `https://public-api.wordpress.com/rest/v1.2/read/feed/108654568/posts/2904184411?http_envelope=1&content_width=656`
