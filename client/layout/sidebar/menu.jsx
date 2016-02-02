/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const SidebarMenu = ( { children, className } ) => (
	<li className={ classNames( 'sidebar__menu', className ) }>{ children }</li>
);

export default SidebarMenu;
