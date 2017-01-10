Searchable
==========

`searchable` is a mixin that adds a text-based `search` method to filter a collection module.

Pass the collections prototype into Searchable, along with an object to specify which nodes on each list-item should be searchable. The `search` method will do an initial `get()` on the collection, so make sure the collection supports a `get()` that will return an array of all items contained in the collection.

Adding mixin to a Collection:

```js
// SomeCollection module

/**
 * Internal dependencies
 */

var Searchable = require( 'searchable' );

/**
 * SomeCollection component
 *
 * @api public
 */

function SomeCollection(){
    if ( ! ( this instanceof SomeCollection ) ) {
        return new SomeCollection();
    }
}

/**
 * Add mixins
 */

Searchable( SomeCollection.prototype, [ 'title', 'description', 'author' ] );

/**
 * Expose `SomeCollection`
 */

module.exports = SomeCollection;
```

Example usage:

```js
var list = require( 'some-collection' )(),
    results = list.search( 'test' );
```

When you add the mixin, you need to pass in a set of `searchNodes` where you specify which nodes on the item are available to search. We don't necessarily want to filter on every single node... for example, we may not want to return a result just because it has a header image whose filename matches the search term. We also cannot assume the list item will be a flat object. It could contain nested nodes that we want to search.

The `searchNodes` parameter is an array that contains strings (for each single node) and/or or a javascript object (to reach a nested node). Objects contain arrays that describe the searchable nodes at the nested level. Nesting can go as deep as you want. An example is in order:

```js
/*
    given a set of items that looks like this:
 */

var data = [ 
{
    title: 'this title',
    author: 'bob ralian',
    urls: {
        public: 'wordpress.com',
        private: 'notwordpress.com'
    },
    editor: {
        primary: 'Susan',
        secondary: 'Kyle'
    }
},
{
    title: 'another title',
    author: 'Jill',
    urls: {
        public: 'test.com',
        private: 'blah.com'
    },
    editor: {
        primary: 'Edith',
        secondary: 'Susan'
    }
} ];

/*
    Lets say you wanted your search to match on; title, author, public and private urls, and just the primary editor (but not the secondary). Your searchNodes parameter would look like this:
 */

var searchNodes = [
    'title', 
    'author', 
    { urls: [ 'public', 'private' ] },
    { editor: [ 'primary' ] }
]
```

TODO:
* Search treats item data nodes as text strings. We should detect for html and only search within textNodes.
* It would be nice to optionally return the matched nodes with the matches called out, possibly with an `<em>` tag, so we can highlight them in the results.