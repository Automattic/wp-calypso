/**
 * Collapse Sidebar Menu Item
 *
 **/

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';

export const CollapseSidebar = ( { title, icon, onClick } ) => {
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

export default CollapseSidebar;
