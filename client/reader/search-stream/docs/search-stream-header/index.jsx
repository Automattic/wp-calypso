/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SearchStreamHeader from '../../search-stream-header';
import { POSTS, SITES } from '../../search-stream-header';

export default class SearchStreamHeaderExample extends PureComponent {
	static displayName = 'SearchStreamHeaderExample';

	state = {
		selected: POSTS,
	};

	render() {
		return (
			<Card>
				<SearchStreamHeader
					selected={ this.state.selected }
					onSelection={ selected => this.setState( { selected } ) }
				/>
			</Card>
		);
	}
}
