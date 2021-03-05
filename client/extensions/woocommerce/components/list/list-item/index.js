/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const ListItem = ( { children, className } ) => {
	return <li className={ classNames( 'list-item', className ) }>{ children }</li>;
};

export default ListItem;
