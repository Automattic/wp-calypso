/**
 * External dependencies
 */
import React from 'react';

const TableHeader = ( { children } ) => {
	return (
		<thead>
			<tr className="table-header__container">
				{ children }
			</tr>
		</thead>
	);
};

export default TableHeader;
