/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const SidebarMenu = ( { children, className } ) => (
	<li className={ classNames( 'sidebar__menu', className ) }>{ children }</li>
);

export default SidebarMenu;
