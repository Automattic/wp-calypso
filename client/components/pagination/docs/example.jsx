/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
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
				<Button className="docs__design-toggle" onClick={ this.toggleCompact }>
					{ this.state.compact ? 'Normal' : 'Compact' }
				</Button>
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
