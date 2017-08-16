Query Comment
=============

`<QueryComment>` requests a single comment to be loaded into Calypso.

## Usage

```js
import QueryComment from 'components/query-comment';

const CommentDetail = ( { comment, commentId, siteId } ) =>
	<div>
		<QueryComment commentId={ commentId } siteId={ siteId } />
		<div>{ comment.date }</div>
		<div>{ comment.content }</div>
	</div>;
```

## Props

| Name | Type | Description |
| --- | --- | --- |
| `commentId` | Number | The comment to request. |
| `context` | String | The request context (default: "display") |
| `siteId` | Number | The site ID for which the comment should be queried. |
