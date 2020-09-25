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
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import SidebarCustomIcon from 'layout/sidebar/custom-icon';

export const CollapseSidebar = ( { title, icon, onClick } ) => {
	return (
		<ExpandableSidebarMenu
			onClick={ onClick }
			title={ title }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
		/>
	);
};

CollapseSidebar.propTypes = {
	title: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
};

export default CollapseSidebar;
