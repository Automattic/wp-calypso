/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';

const Table = ( { children } ) => {
	return (
		<Card className="table">
			<table className="table__table">
				{ children }
			</table>
		</Card>
	);
};

export default Table;
