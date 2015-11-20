Lock
====


A simple non-async lock object inspired by the mutex (Mutual Exclusion) locks found in concurrency control programming ([Wikipedia](https://en.wikipedia.org/wiki/Lock_(computer_science))).

It emits `change` upon successful locking or unlocking, and hence works nicely with the `data-observe` mixin.


### Why?

Potential use cases:

- If you have several entities that need to access a limited resource that can only be used by one entity at a time — e.g. entities performing atomic sets of reads & writes to a certain file.

- More generally, if you need to enforce an arbitrary constraint across a set of entities, such as state that may be held by no more than one entity at a time. See `my-sites/menus` for an actual example.


### Usage

Lock has React components in mind, but is by no means limited to them.

```js
var Lock = require( 'lock' ),
	lock = new Lock();

lock.lock( entity1 ); // entity1 holds the lock, as confirmed by true return value
lock.lock( entity2 ); // fails, as confirmed by false return value

[ entity1, entity2 ].forEach( function( entity ) {
	if ( lock.hasLock( entity ) ) {
		entity.say( "omg, I am sooo exclusive" );
		entity.doExclusiveThing();
		lock.unlock( entity ); // now now, learn to share
	} else {
		entity.say( "Not my turn" );
	}
} );
```

Consider naming your Lock instance something more meaningful, like `resourceBroker` — or even `resource` if you mix the Lock into the resource you seek to manage.


### Caveats

Be careful not to "lose" the instance currently holding the lock. In the case of React components, consider adding something like:

```js
componentWillUnmount: function() {
	this.props.lock.unlock( this, { silent: true } );
},
```

