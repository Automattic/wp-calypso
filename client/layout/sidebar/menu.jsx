import classNames from 'classnames';
import { forwardRef } from 'react';

const SidebarMenu = forwardRef( ( { children, className, ...props }, ref ) => (
	<ul ref={ ref } className={ classNames( 'sidebar__menu', className ) } { ...props }>
		{ children }
	</ul>
) );

export default SidebarMenu;
