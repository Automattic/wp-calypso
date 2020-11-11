/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const SidebarMenu = ( { children, className, ...props } ) => (
	<ul className={ classNames( 'sidebar__menu', className ) } { ...props }>
		{ children }
	</ul>
);

export default SidebarMenu;
