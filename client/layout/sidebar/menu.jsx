/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const SidebarMenu = ( { children, className } ) => (
	<ul className={ classNames( 'sidebar__menu', className ) }>{ children }</ul>
);

export default SidebarMenu;
