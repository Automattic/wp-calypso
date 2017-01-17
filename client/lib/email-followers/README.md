Email Followers
===============

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for managing a site's email followers in Calypso.

####Public Methods

**EmailFollowersStore.getFollowers( fetchOptions );**

Returns an array of all followers that have been fetched for the given fetch options

---

**EmailFollowersStore.getPaginationData( fetchOptions );**

This data will help with pagination and infinite scroll.

###Actions
Actions get triggered by views and stores.

####Public methods.

**EmailFollowersActions.fetchFollowers( fetchOptions );**

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
import EmailFollowersStore from 'lib/followers/wpcom-followers-store';
import EmailFollowersActions from 'lib/followers/actions';

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
		EmailFollowersActions.fetchFollowers( this.getFetchOptions() );
		EmailFollowersStore.on( 'change', this.refreshFollowers );
	}

	componentWillUnmount() {
		EmailFollowersStore.removeListener( 'change', this.refreshFollowers );
	}

	getFollowers() {
		return {
			followers: EmailFollowersStore.getFollowers( this.getFetchOptions() )
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
```cd client/lib/email-followers/ && make test```
