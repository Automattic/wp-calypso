/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const ListHeader = ( { className, children } ) => {
	return <li className={ classNames( 'list-header', className ) }>{ children }</li>;
};

export default ListHeader;
