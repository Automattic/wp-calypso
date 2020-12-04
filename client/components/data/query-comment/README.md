# Query Comment

`<QueryComment>` requests a single comment to be loaded into Calypso.

## Usage

```js
import QueryComment from 'calypso/components/query-comment';

const CommentDetail = ( { comment, commentId, siteId } ) => (
	<div>
		<QueryComment commentId={ commentId } siteId={ siteId } />
		<div>{ comment.date }</div>
		<div>{ comment.content }</div>
	</div>
);
```

## Props

| Name         | Type   | Description                                          |
| ------------ | ------ | ---------------------------------------------------- |
| `commentId`  | Number | The comment to request.                              |
| `siteId`     | Number | The site ID for which the comment should be queried. |
| `forceWpcom` | Bool   | (default: false) Forces the request to wpcom.        |
