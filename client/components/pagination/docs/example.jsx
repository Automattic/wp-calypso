/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Pagination from 'components/pagination';

class PaginationExample extends Component {
	state = {
		page: 1,
		compact: false,
	};

	updatePage = ( page ) => {
		this.setState( { page } );
	};

	toggleCompact = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		return (
			<div>
				<button className="docs__design-toggle button" onClick={ this.toggleCompact }>
					{ this.state.compact ? 'Normal' : 'Compact' }
				</button>
				<Pagination
					compact={ this.state.compact }
					page={ this.state.page }
					perPage={ 10 }
					total={ 100 }
					pageClick={ this.updatePage }
				/>
			</div>
		);
	}
}
PaginationExample.displayName = 'PaginationExample';

export default PaginationExample;
