/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const ListTd = ( { children, width } ) => {
	const percentage = `${ width }%`;
	return (
		<td className="list-td" style={ { width: percentage } }>
			{ children }
		</td>
	);
};

export default ListTd;
