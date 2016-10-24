Comments
========

## This store has the following structure:

```
comments = {
	items: Immutable.Map<CommentTargetId, Immutable.List<Comment>>, // Comment is a Immutable.Map in the shape that returned by wpcom, ordered by date DESC
	requests: Immutable.Map<CommentTargetId, Map<RequestId, ActionType>>,
	totalCommentsCount: Immutable.Map<CommentTargetId, Number>
}>;
```

## Types:
	CommentTargetId: `${siteId}-${postId}`;
	RequestId: `${siteId}-${postId}-${stringify(query)}`; // query is the query to wpcom replies()

## Selectors
All selectors receive redux state and { siteId, postId }.
The more "complex" ones, like ``getPostCommentsTree`` implemented with ``lib/combine-selector``. 

getPostCommentsTree - returns a memoized comments tree of the form:
```
	Tree: Map<CommentId, CommentNode>;
	in addition to the CommentId => CommentNode map, it has the following property:
		children: List<CommentId> // root-level comments ordered by date
```

```
	CommentNode: Map<> {
		children: List<CommentId>,
		data: Map | undefined, // the comment as received from wpcom API, if not yet received: undefined
		parentId: CommentId | null | undefined, // if we don't know yet, set to undefined. if comment has parent then set to number else to null 
	}
```

### Simple selectors:
getPostCommentItems - gets items of siteId, postId;
getPostCommentRequests - gets requests of siteId, postId
getPostTotalCommentsCount - gets totalCommentsCount of siteId, postId

### Compute selectors:
getPostMostRecentCommentDate - gets the date of most recent comment 
getPostOldestCommentDate - gets the date of the earliest comment
getPostCommentsTree - computes a comments tree
haveMoreCommentsToFetch - concludes whether there are more comments to fetch according to totalCommentsCount and items.size


## How it works
### Comments fetching
We pull from the API in reverse chronological order (going back in time with `before` field) via `actions#requestPostComments()`, 
building up the comment tree (`reducer#tree`) as we process each comment.

Since replies have to happen after the initial comment, we'll process all replies to a comment before the comment itself,
util we have seen an actual node, a placeholder CommentNode with `parentId === undefined` and `data === undefined` is
placed on the tree.

_Note: Since we haven't seen the parent of the placeholder CommentNode, that node won't be reachable from the root 
children list, but can be reached directly by ID._
