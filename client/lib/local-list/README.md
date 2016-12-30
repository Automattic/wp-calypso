LocalList
=========
Adds local storage caching for api results.  With LocalList, other `list` modules can cache results in localStorage for snappier component loads.  

The LocalList creates an array of objects to cache API payloads.  An object itself looks like the following:

```js
{
	key: 'someKeyName', // the key sent in calls to set( key, value )
	createdAt: timestamp, // a timestamp of when this record was saved locally for use in expiring cache or fetch()ing new data
	data: {} // the value sent in set( key, value ) 
}
```

Dependencies
============

* store.js - local storage wrapper
* mocha/chai - for testing

Setup
=====
First require the module:

```es6
LocalList = require( 'local-list' )
```

Then create an instance of LocalList:

```es6
this.local = LocalList( { localStoreKey: 'keyUsedInLocalStorage', limit: 25 } );
```

The configuration options are:

* `localStoreKey` (string) - the key that `LocalList` will store all data under REQUIRED
* `limit` (int) - max number of entries to keep for this localStorage item, defaults to 10.

Methods
=======

After the setup is complete you have access to the following methods:

## getData()
Returns the local storage contents for your localStoreKey

## clear()
Deletes any local storage for this key, and sets it to an empty array.

## set( key, value )
Saves a record to the local storage array:

```js
{
	key: key,
	createdAt: timestamp,
	data: value
}
```

Ensures only one instance of `key` exists in the localStorage array.  Also limits the total number of items in the array to that specified in `localStoreLimit` || 10.

## find( key )
Returns the record from `localData()` that has the matching `key`.  If no match is found returns false

Tests
=====
To run the tests `make`.