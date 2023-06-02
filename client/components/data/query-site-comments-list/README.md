# Query Site Comments List

`<QuerySiteCommentsList />` requests that a list of comments for a given site be loaded into Calypso.

## Usage

```js
import QuerySiteCommentsList from 'calypso/components/data/query-site-comments-list';

const CommentList = ( { comments, siteId } ) => (
	<div>
		<QuerySiteCommentsList siteId={ siteId } />
		{ comments.map(/*...*/) }
	</div>
);
```

## Props

With the exception of `siteId`, this component accepts as props all query parameters listed here:
[https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/)

| Name     | Type   | Required? | Description                         |
| -------- | ------ | --------- | ----------------------------------- |
| `siteId` | Number | Yes       | Site for whose comments to retrieve |
