/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const ListTable = ( { children } ) => {
	return (
		<Card className="list-table">
			<table className="list-table__table">
				{ children }
			</table>
		</Card>
	);
};

export default ListTable;
