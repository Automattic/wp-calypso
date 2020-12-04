/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Search from 'calypso/components/search';
import SearchCard from 'calypso/components/search-card';

/**
 * Globals
 */
const noop = () => {};

class SearchDemo extends PureComponent {
	static displayName = 'Search';

	render() {
		return (
			<div>
				<Search
					onSearch={ noop }
					placeholder="What are you looking for?"
					inputLabel="What do you seek? This is different on purpose."
				/>
				<h2>Search Card</h2>
				<SearchCard
					onSearch={ noop }
					placeholder="Seek and you shall find"
					inputLabel="Seek and you shall find"
				/>
			</div>
		);
	}
}

export default SearchDemo;
