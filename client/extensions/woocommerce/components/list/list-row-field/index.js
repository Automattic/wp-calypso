/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const ListRowField = ( { children, width } ) => {
	return (
		<td className="list-row-field" style={ { width: width } }>
			{ children }
		</td>
	);
};

export default ListRowField;
