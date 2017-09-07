Users
=====

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for managing a site's users in Calypso.

###The Data

The Data is stored in a private variable but can be accessed though the stores public methods.
 
####Public Methods
 
**UsersStore.getUsers( options );**
 
Returns an array of users that have been fetched with the given options describing the fetch query.

---

**UsersStore.getPaginationData( options );**
 
Returns an object: ```{ totalUsers: int, fetchingUsers: bool, usersCurrentOffset: int, numUsersFetched: int }``
This data will help with pagination and infinite scroll.

###Actions 
Actions get triggered by views and stores. 

####Public methods.

**UsersActions.fetchUsers( options );**

`options` is an object that describes any custom query params you want to pass into the `wpcom.js` [usersList method](https://github.com/Automattic/wpcom.js/blob/master/docs/site.md#siteuserslistquery-fn) which passes parameters into the REST API [`/site/$site/users` endpoint](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/users/). The only required attribute is siteId. Current default values include:

```js
{
	number: 100,
	offset: 0
}
```

###Example Component Code

```es6
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var UsersStore = require( 'lib/users/store' );

module.exports = React.createClass( { 

	displayName: 'yourComponent',
	
	componentDidMount: function() {
		UsersStore.on( 'change', this.refreshUsers );
	},
	
	componentWillUnmount: function() {
		UsersStore.removeListener( 'change', this.refreshUsers );
	},

	getInitialState: function() {
		return this.getUsers();
	},
	
	getUsers: function() {
		return {
			users: UsersStore.fetch( { siteId: this.props.site.ID } )
		};
	},

	refreshUsers: function() {
		this.setState( this.getUsers() );
	},
	
	render: function() {
		
	}
	
} );

```
