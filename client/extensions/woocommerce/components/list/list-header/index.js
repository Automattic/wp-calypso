/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const ListHeader = ( { className, children } ) => {
	return (
		<li className={ classNames( 'list-header', className ) } >
			{ children }
		</li>
	);
};

export default ListHeader;
