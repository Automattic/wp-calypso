import clsx from 'clsx';
import { Children } from 'react';
import SidebarRegion from './region';
import './style.scss';

const Sidebar = ( { children, onClick = undefined, className = '', ...props } ) => {
	const hasRegions = Children.toArray( children ).some( ( el ) => el.type === SidebarRegion );
	const finalClassName = clsx( 'sidebar', className, { 'has-regions': hasRegions } );

	return (
		<ul
			role="presentation"
			className={ finalClassName }
			onClick={ onClick }
			data-tip-target="sidebar"
			{ ...props }
		>
			{ children }
		</ul>
	);
};

export default Sidebar;
