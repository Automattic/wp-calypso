import classNames from 'classnames';
import React from 'react';
import SidebarRegion from './region';
import './style.scss';

const Sidebar = ( { children, onClick, className, ...props } ) => {
	const hasRegions = React.Children.toArray( children ).some( ( el ) => el.type === SidebarRegion );
	const finalClassName = classNames( 'sidebar', className, { 'has-regions': hasRegions } );

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
