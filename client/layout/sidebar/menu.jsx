/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

const SidebarMenu = React.forwardRef( ( { children, className, ...props }, ref ) => (
	<ul ref={ ref } className={ classNames( 'sidebar__menu', className ) } { ...props }>
		{ children }
	</ul>
) );

export default SidebarMenu;
