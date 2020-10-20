/**
 * Collapse Sidebar Menu Item
 *
 **/

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isWithinBreakpoint } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';
import { collapseSidebar, expandSidebar } from 'calypso/state/ui/actions';

export const CollapseSidebar = ( {
	title,
	icon,
	sidebarIsCollapsed,
	collapseTheSidebar,
	expandTheSidebar,
} ) => {
	const collapsed = sidebarIsCollapsed && isWithinBreakpoint( '>800px' );

	useEffect( () => {
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
			onNavigate={ sidebarIsCollapsed ? expandTheSidebar : collapseTheSidebar }
			label={ title }
			link={ '' }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
		/>
	);
};

CollapseSidebar.propTypes = {
	title: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
	sidebarIsCollapsed: PropTypes.bool.isRequired,
	collapseTheSidebar: PropTypes.func.isRequired,
	expandTheSidebar: PropTypes.func.isRequired,
};

export default connect(
	( state ) => {
		return { sidebarIsCollapsed: getSidebarIsCollapsed( state ) };
	},
	{ collapseTheSidebar: () => collapseSidebar(), expandTheSidebar: () => expandSidebar() }
)( CollapseSidebar );
