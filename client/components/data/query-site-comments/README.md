Query Site Comments
================

`<QuerySiteComments />` requests that recent comments for a given site be loaded into Calypso.
It should be used when we need comments but don't have a specific associated post.
In many cases, for instance, we are looking for comment replies to a specific post, but in this case we are working with comments for any and all posts across an entire site.

## Usage

There is planned support for additional features not yet implemented:
 - paging and limiting
 - specifying type of comments (pingbacks, trackbacks, etc…)
 - ordering
 - Pinghub connection

```js
import QuerySiteComments from 'components/data/query-site-comments'

const CommentList = ( { comments, siteId } ) => (
	<div>
		<QuerySiteComments siteId={ siteId } />
		{ comments.map( … ) }
	</div>
)
```

## Props

| Name | Type | Required? | Default | Description |
| --- | --- | --- | --- | --- |
| `siteId` | Number | Yes | | Site for whose recent comments to retrieve |
| `status` | String | No | `unapproved` | Which comments to retrieve<br /> <ul><li>`all`</li><li>`approved`</li><li>`unapproved`</li><li>`spam`</li><li>`trash`</li></ul> |
