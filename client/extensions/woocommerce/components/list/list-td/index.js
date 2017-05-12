/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const ListTd = ( { children, width } ) => {
	return (
		<td className="list-td" style={ { width: width } }>
			{ children }
		</td>
	);
};

export default ListTd;
