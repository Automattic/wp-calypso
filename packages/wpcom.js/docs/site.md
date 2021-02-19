# Site

`Site` handler class.

## Example

Create a `Site` instance from WPCOM

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const suggestions = wpcom.users().suggest( '<site-id>' );
```

## API

### Site(id, WPCOM)

Create a new `Site` instance giving `id` and `WPCOM` instance.

```js
const site = Site( '<id>', WPCOM );
```

### Site#get([query, ]fn)

Get site information

```js
site.get( function ( err, info ) {
	// `info` data object
} );
```

### Site#usersList([query, ]fn)

List the users of a site

```js
site.usersList( function ( err, list ) {
	// `list` data object
} );
```

### Site#postsList([query, ]fn)

Get site posts list

```js
site.postsList( function ( err, list ) {
	// `list` data object
} );
```

### Site#mediaList([query, ]fn)

Get site media list

```js
site.mediaList( function ( err, list ) {
	// `list` data object
} );
```

## Site - Post

### Site#post(id)

Create a new `Post` instance.
More info in [Site post page](./post.md).

```js
const post = site.post( '<post-id>' );
```

### Site#addPost(data, fn)

Add a new post to site. Return a `Post` instance.

```js
const new_post = site.addPost( { title: 'It is my new post' }, function ( err, post ) {} );
```

### Site#deletePost(id, fn)

Delete a blog post

```js
const del_post = site.deletePost( '<post-id>', function ( err, post ) {} );
```

## Site - Media

### Site#media(id)

Create a new `Media` instance.

```js
const media = site.media( '<media-id>' );
```

### Site#addMediaFile(data, fn)

Add a new media to site. Return a `Media` instance.

```js
const new_media = site.addMedia( { urls: [] }, function ( err, list ) {} );
```

## Site - Stats

With a site instance, you can also access all of the [stats endpoints](https://developer.wordpress.com/docs/api/#stats)

```js
const site = Site( '<id>', WPCOM );
```

### Site#stats([query, ]fn)

Returns basic site [stats](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/).

```js
site.stats( function ( err, data ) {
	// data is site stats response
} );
```

### Site#statsClicks([query, ]fn)

Returns stats [clicks](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/clicks/) data.

```js
site.statsClicks( function ( err, data ) {
	// data clicks response
} );
```

### Site#statsComments([query, ]fn)

Returns stats [comments](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/comments/) data.

```js
site.statsComments( function ( err, data ) {
	// data comments response
} );
```

### Site#statsCommentFollowers([query, ]fn)

Returns stats [comment followers](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/comment-followers/) data.

```js
site.statsComments( function ( err, data ) {
	// data comment-follwers response
} );
```

### Site#statsCountryViews([query, ]fn)

Returns stats [country views](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/country-views/) data.

```js
site.statsCountryViews( function ( err, data ) {
	// data country-views response
} );
```

### Site#statsFollowers([query, ]fn)

Returns [followers](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/followers/) data.

```js
site.statsFollowers( function ( err, data ) {
	// data followers response
} );
```

### Site#statsPostViews(postId,[query, ]fn)

Returns stats for a certain [post](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/post/%24post_id/).

```js
site.statsPostViews( postId, function ( err, data ) {
	// data post views response
} );
```

### Site#statsPublicize([query, ]fn)

Returns [publicize](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/publicize/) data.

```js
site.statsPublicize( function ( err, data ) {
	// data publicize response
} );
```

### Site#statsReferrers([query, ]fn)

Returns [referrers](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/referrers/) data.

```js
site.statsReferrers( function ( err, data ) {
	// data referrers response
} );
```

### Site#statsRefferersSpamNew(domain, fn)

Marks a certain domain referrer as [spam](https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/stats/referrers/spam/new/).

```js
site.statsRefferersSpamNew( domain, function ( err, response ) {
	// response returned from procedure
} );
```

### Site#statsRefferersSpamDelete(domain, fn)

Removes a domain from referrer [spam](https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/stats/referrers/spam/delete/) list.

```js
site.statsRefferersSpamDelete( domain, function ( err, response ) {
	// response returned from procedure
} );
```

### Site#statsSearchTerms([query, ]fn)

Returns [search terms](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/search-terms/) data.

```js
site.statsSearchTerms( function ( err, data ) {
	// data search terms response
} );
```

### Site#statsStreak([query, ]fn)

Returns [streak](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/streak/) data.

```js
site.statsStreak( function ( err, data ) {
	// data streak response
} );
```

### Site#statsSummary([query, ]fn)

Returns [summary](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/summary/) data.

```js
site.statsSummary( function ( err, data ) {
	// data summary response
} );
```

### Site#statsTags([query, ]fn)

Returns [tags](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/tags/) data.

```js
site.statsTags( function ( err, data ) {
	// data tags response
} );
```

### Site#statsTopAutors([query, ]fn)

Returns [top authors](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/top-authors/) data.

```js
site.statsTopAuthors( function ( err, data ) {
	// data top authors response
} );
```

### Site#statsVideo(videoId,[query, ]fn)

Returns stats about a particular VideoPress [video](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/video/%24post_id/).

```js
site.statsVideo( videoId, function ( err, data ) {
	// data about the video
} );
```

### Site#statsVideoPlays([query, ]fn)

Returns [video plays](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/video-plays/) data.

```js
site.statsVideoPlays( function ( err, data ) {
	// data video plays response
} );
```

### Site#statsVisits([query, ]fn)

Returns [visits](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/visits/) data.

```js
site.statsVisits( function ( err, data ) {
	// data visits response
} );
```
