# Followers

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for managing a site's followers in Calypso.

## Followers Store

### Public Methods

#### FollowersStore.getFollowers( fetchOptions );

Returns an array of all followers that have been fetched for the given fetch options

---

#### FollowersStore.getPaginationData( fetchOptions );

This data will help with pagination and infinite scroll.

## Actions

Actions get triggered by views and stores.

### Public methods

#### FollowersActions.fetchFollowers( fetchOptions );

Fetches followers in batches of 100 starting from the given page, which defaults to 1.

## Example Component Code

```jsx
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FollowersStore from 'calypso/lib/followers/wpcom-followers-store';
import FollowersActions from 'calypso/lib/followers/actions';

export default class extends React.Component {
	static displayName = 'yourComponent';

	state = this.getFollowers();

	fetchOptions = {
		siteId: this.props.siteId,
		type: 'email',
	};

	componentDidMount() {
		FollowersActions.fetchFollowers( this.fetchOptions );
		FollowersStore.on( 'change', this.refreshFollowers );
	}

	componentWillUnmount() {
		FollowersStore.removeListener( 'change', this.refreshFollowers );
	}

	getFollowers = () => {
		return {
			followers: FollowersStore.getFollowers( this.props.fetchOptions ),
		};
	};

	refreshFollowers = () => {
		this.setState( this.getFollowers() );
	};

	render() {}
}
```
