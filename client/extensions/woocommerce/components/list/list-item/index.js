/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const ListItem = ( { children, className } ) => {
	return (
		<li className={ classNames( 'list-item', className ) }>
			{ children }
		</li>
	);
};

export default ListItem;
