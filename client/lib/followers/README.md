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
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FollowersStore from 'lib/followers/wpcom-followers-store';
import FollowersActions from 'lib/followers/actions';

class YourComponent extends Component {

	constructor() {
		super( ...arguments );

		this.state = this.getFollowers();
	}
	
	getFetchOptions() {
		return {
			siteId: this.props.siteId,
			type: 'email',
		};
	}

	componentDidMount() {
		FollowersActions.fetchFollowers( this.getFetchOptions() );
		FollowersStore.on( 'change', this.refreshFollowers );
	}
	
	componentWillUnmount() {
		FollowersStore.removeListener( 'change', this.refreshFollowers );
	}
	
	getFollowers() {
		return {
			followers: FollowersStore.getFollowers( this.getFetchOptions() )
		};
	}

	refreshFollowers() {
		this.setState( this.getFollowers() );
	}
	
	render() {
		...
	}
	
}
```

###Testing

To run tests go to 
```cd client/lib/followers/ && make test```