/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import Pagination from 'client/components/pagination';

class PaginationExample extends Component {
	state = {
		page: 1,
	};

	updatePage = page => {
		this.setState( { page } );
	};

	render() {
		return (
			<Card>
				<Pagination
					page={ this.state.page }
					perPage={ 10 }
					total={ 100 }
					pageClick={ this.updatePage }
				/>
			</Card>
		);
	}
}
PaginationExample.displayName = 'PaginationExample';

export default PaginationExample;
