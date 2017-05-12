/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const ListHeader = ( { children } ) => {
	return (
		<thead>
			<tr className="list-header__container">
				{ children }
			</tr>
		</thead>
	);
};

export default ListHeader;
