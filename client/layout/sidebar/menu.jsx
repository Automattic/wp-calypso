import classNames from 'classnames';
import React from 'react';

const SidebarMenu = React.forwardRef( ( { children, className, ...props }, ref ) => (
	<ul ref={ ref } className={ classNames( 'sidebar__menu', className ) } { ...props }>
		{ children }
	</ul>
) );

export default SidebarMenu;
