/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import SidebarRegion from './region';

/**
 * Style dependencies
 */
import './style.scss';

const Sidebar = ( { children, onClick, className, ...props } ) => {
	const hasRegions = React.Children.toArray( children ).some( ( el ) => el.type === SidebarRegion );
	const finalClassName = classNames( 'sidebar', className, { 'has-regions': hasRegions } );

	return (
		<div
			role="presentation"
			className={ finalClassName }
			onClick={ onClick }
			data-tip-target="sidebar"
			{ ...props }
		>
			{ children }
		</div>
	);
};

export default Sidebar;
