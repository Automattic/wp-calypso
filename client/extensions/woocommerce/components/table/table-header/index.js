/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

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
