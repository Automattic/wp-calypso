/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class ListTable extends Component {

	render() {
		const { children } = this.props;
		return (
			<Card className="list-table">
				<table className="list-table__table">
					{ children }
				</table>
			</Card>
		);
	}

}

export default ListTable;
