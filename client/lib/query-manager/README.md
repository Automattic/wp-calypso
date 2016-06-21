Query Manager
=============

Query Manager is an extendable utility class intended for managing complex data sets where items can be associated with one or more queries and can change over time.

In a nutshell, Query Manager recreates the storage and querying of resources completely within the client, enabling us to optimistically predict the effects of particular actions taken on those resources.

## Usage

At its core is the `receive` method, which can be used in a number of contexts:

- Identifying the item(s) associated with a query object (with the `query` option)
- Indicating the total number of items that match a query (with the `found` option)
- Replacing an item (effective across all tracked queries)
- Applying a partial change to an item (effective across all tracked queries, with the `patch` option)
- Receive a new set of items to be associated with a query, either replacing the existing query set or merging the two (with the `mergeQuery` option)

Once items have been inserted into the query manager, they can then be retrieved with the following methods:

- `getItem( itemKey: string )` - Returns a single item
- `getItems( query: ?object )` - Returns all items tracked, optionally only those associated with the passed query
- `getFound( query: object )` - Returns the total number of items matching a query
- `removeItem( itemKey: string )` - Removes a single item, returning a new instance if changed
- `removeItems( itemKeys: string[] )` - Removes items, returning a new instance if changed

Under the hood, Query Manager reconciles any change to an item across all queries where that item is tracked. 

## Example

In a `PostQueryManager` instance tracking both draft posts and trashed posts, if I were to call `receive` with a partial change indicating that a single draft had been moved to trash, that post would (1) be updated across all queries tracking it, (2) be removed from the drafts query set, (3) be added to the trashed query set, (4) be sorted according to the query's sorting parameter, (5) redistribute the affected pagination results in both drafts and trashed, and (6) decrement/increment the found counts respectively.

## Implementations

On its own, Query Manager does not serve much use. It is intended to be extended with an implementation customizing the filtering, sorting, and merging behavior specific to a particular type of data.

Currently, the following implementations exist:

- [`PaginatedQueryManager`](./paginated): An extendable class for managing paginated data
- [`PostQueryManager`](./post): Manages paginated queries of post objects ([refer to API documentation for querying options](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/))
- [`TermQueryManager`](./pterm): Manages paginated queries of term objects ([refer to API documentation for querying options](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/taxonomies/%24taxonomy/terms/))

## Extending

Depending on the level of customization you need, you'll likely only need to implement the `matches` and `sort` methods.

- `matches( query: object, item: object )` should return true if the passed item should be included in the query set
- `sort( itemA: object, itemB: object )` is a sort comparator function, returning -1 to indicate "A before B", 1 to indicate "A after B", or 0 to indicate equality ([see `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort))

Sometimes you may need to make further customizations. Some examples include:

- `PostQueryManager` and `TermQueryManager` extend the [`QueryKey`](./key.js) implementation to remove default query values from the serialized query. The purpose of this is to ensure that queries are considered the same whether or not they include a default value. For example, including `page: 1` in a query should be counted the same if it were left out entirely.

## More Information

The code for Query Manager and all of its implementations are thoroughly documented using JSDoc, including typed parameters. Additionally, each includes a complete set of test cases describing the expected behavior.

The following pull requests can serve as background for this library:

- [#5135](https://github.com/Automattic/wp-calypso/pull/5135)
- [#6022](https://github.com/Automattic/wp-calypso/pull/6022)
