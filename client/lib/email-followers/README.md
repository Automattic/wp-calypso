# Email Followers

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for managing a site's email followers in Calypso.

## Email Followers Store

### Public Methods

#### EmailFollowersStore.getFollowers( fetchOptions );

Returns an array of all followers that have been fetched for the given fetch options

---

#### EmailFollowersStore.getPaginationData( fetchOptions );

This data will help with pagination and infinite scroll.

## Actions

Actions get triggered by views and stores.

### Public methods

#### EmailFollowersActions.fetchFollowers( fetchOptions );

Fetches followers in batches of 100 starting from the given page, which defaults to 1.

## Example Component Code

```js
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailFollowersStore from 'calypso/lib/followers/wpcom-followers-store';
import EmailFollowersActions from 'calypso/lib/followers/actions';

export default class extends React.Component {
	static displayName = 'yourComponent';
	state = this.getFollowers();

	fetchOptions = {
		siteId: this.props.siteId,
		type: 'email',
	};

	componentDidMount() {
		EmailFollowersActions.fetchFollowers( this.fetchOptions );
		EmailFollowersStore.on( 'change', this.refreshFollowers );
	}

	componentWillUnmount() {
		EmailFollowersStore.removeListener( 'change', this.refreshFollowers );
	}

	getFollowers = () => {
		return {
			followers: EmailFollowersStore.getFollowers( this.props.fetchOptions ),
		};
	};

	refreshFollowers = () => {
		this.setState( this.getFollowers() );
	};

	render() {}
}
```
