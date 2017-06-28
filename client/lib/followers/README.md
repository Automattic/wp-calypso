Followers
=========

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for managing a site's followers in Calypso.
 
####Public Methods
 
**FollowersStore.getFollowers( fetchOptions );**
 
Returns an array of all followers that have been fetched for the given fetch options

---

**FollowersStore.getPaginationData( fetchOptions );**

This data will help with pagination and infinite scroll.

###Actions 
Actions get triggered by views and stores. 

####Public methods.

**FollowersActions.fetchFollowers( fetchOptions );**

Fetches followers in batches of 100 starting from the given page, which defaults to 1.

###Example Component Code

```es6
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var FollowersStore = require( 'lib/followers/wpcom-followers-store' ),
	FollowersActions = require( 'lib/followers/actions' );

module.exports = React.createClass( { 

	displayName: 'yourComponent',
	
	fetchOptions: {
	    siteId: this.props.siteId,
	    type: 'email'
	},
	
	componentDidMount: function() {
		FollowersActions.fetchFollowers( this.fetchOptions );
		FollowersStore.on( 'change', this.refreshFollowers );
	},
	
	componentWillUnmount: function() {
		FollowersStore.removeListener( 'change', this.refreshFollowers );
	},

	getInitialState: function() {
		return this.getFollowers();
	},
	
	getFollowers: function() {
		return {
			followers: FollowersStore.getFollowers( this.props.fetchOptions )
		};
	},

	refreshFollowers: function() {
		this.setState( this.getFollowers() );
	},
	
	render: function() {
		
	}
	
} );

```
