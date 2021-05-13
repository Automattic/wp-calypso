# Query Site Comments Tree

`<QuerySiteCommentsTree />` requests that the entire tree of comments for a given site be loaded into Calypso.
Only the strictly needed comment identifiers will be returned (`commentId`, `parentCommentId`, `postId`, `status`).

## Usage

There is planned support for additional features not yet implemented:

- specifying type of comments (pingbacks, trackbacks, etc…)
- ordering
- Pinghub connection

```js
import QuerySiteCommentsTree from 'calypso/components/data/query-site-comments-tree';

const CommentList = ( { comments, siteId } ) => (
	<div>
		<QuerySiteCommentsTree siteId={ siteId } />
		{ comments.map(/*...*/) }
	</div>
);
```

## Props

| Name     | Type   | Required? | Default      | Description                                                                                                                     |
| -------- | ------ | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `siteId` | Number | Yes       |              | Site for whose comments to retrieve                                                                                             |
| `status` | String | No        | `unapproved` | Which comments to retrieve<br /> <ul><li>`all`</li><li>`approved`</li><li>`unapproved`</li><li>`spam`</li><li>`trash`</li></ul> |
