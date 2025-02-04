# Reader

The Reader module handles the view and routing logic for the _Reader_ section of Calypso.

These routes are served by the module:

- /activities/likes
- /reader/\*
- /recommendations (redirects to /reader/search)
- /tag/\*

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
