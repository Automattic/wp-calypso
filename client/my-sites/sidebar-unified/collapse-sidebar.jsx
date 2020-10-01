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

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import { getSidebarIsCollapsed } from 'calypso/state/ui/sidebar-visibility/selectors';
import { collapseSidebar, expandSidebar } from 'calypso/state/ui/sidebar-visibility/actions';

export const CollapseSidebar = ( { title, icon, sidebarIsCollapsed } ) => {
	useEffect( () => {
		sidebarIsCollapsed
			? document.body.classList.add( 'is-sidebar-collapsed' )
			: document.body.classList.remove( 'is-sidebar-collapsed' );
	}, [ sidebarIsCollapsed ] );
	console.log( sidebarIsCollapsed );
	return (
		<SidebarItem
			className="collapse-sidebar__toggle"
			onNavigate={ onClick }
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

export default connect(
	( state ) => {
		return { sidebarIsCollapsed: getSidebarIsCollapsed( state ) };
	},
	{ collapseSidebar, expandSidebar }
)( CollapseSidebar );
