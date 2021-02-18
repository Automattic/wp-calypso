/**
 * Collapse Sidebar Menu Item
 *
 **/

/**
 * External dependencies
 */
import React, { useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { isWithinBreakpoint } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';
import { collapseSidebar, expandSidebar } from 'calypso/state/ui/actions';

export const CollapseSidebar = ( { title, icon } ) => {
	const reduxDispatch = useDispatch();
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const collapsed = sidebarIsCollapsed && isWithinBreakpoint( '>800px' );

	useLayoutEffect( () => {
		// Adding / removing clear-secondary-layout-transitions is a workaround to avoid site-selector being transitioning while expanding the sidebar (client/my-sites/sidebar-unified/style.scss).
		collapsed
			? document.body.classList.add( 'is-sidebar-collapsed', 'clear-secondary-layout-transitions' )
			: document.body.classList.remove( 'is-sidebar-collapsed' );

		// Needs to be queued for removal after is-sidebar-collapsed is removed
		if ( ! collapsed ) {
			const timer = setTimeout( () => {
				document.body.classList.remove( 'clear-secondary-layout-transitions' );
			} );
			return () => clearTimeout( timer );
		}
	}, [ collapsed ] );

	return (
		<SidebarItem
			className="collapse-sidebar__toggle"
			onNavigate={
				sidebarIsCollapsed
					? () => reduxDispatch( expandSidebar() )
					: () => reduxDispatch( collapseSidebar() )
			}
			label={ title }
			link={ '' }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
		/>
	);
};

CollapseSidebar.propTypes = {
	title: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
};

export default CollapseSidebar;
