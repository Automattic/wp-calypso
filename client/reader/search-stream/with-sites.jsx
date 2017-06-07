/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import withWidth from 'lib/with-width';
import SearchStreamHeader from './search-stream-header';
import { POSTS } from './search-stream-header';

/**
 * Internal Dependencies
 */

const WIDE_DISPLAY_CUTOFF = 660;

class SearchStream extends React.Component {

	state = {
		selected: POSTS,
	};

	handleHeaderSelection = selected => this.setState( { selected } );

	render() {
		return (
			<div>
				<SearchStreamHeader
					selected={ this.state.selected }
					onSelection={ this.handleHeaderSelection }
					wideDisplay={ this.props.width > WIDE_DISPLAY_CUTOFF }
				/>
			</div>
		);
	}
}

export default localize( withWidth( SearchStream ) ) ;
