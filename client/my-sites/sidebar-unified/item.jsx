/**
 * MySitesSidebarUnifiedItem
 *
 * Renders a sidebar menu item with no child items.
 * This could be a top level item, or a child item nested under a top level menu.
 * These two cases might be to be split up?
 */
/**
 * External dependencies
 */
import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';

export const MySitesSidebarUnifiedItem = ( {
	count,
	icon,
	isSubItem = false,
	selected = false,
	slug,
	title,
	url,
	isHappychatSessionActive,
	isJetpackNonAtomicSite,
	continueInCalypso,
} ) => {
	const reduxDispatch = useDispatch();

	const onNavigate = () => {
		reduxDispatch( collapseAllMySitesSidebarSections() );
		window.scrollTo( 0, 0 );
	};

	return (
		<SidebarItem
			count={ count }
			label={ title }
			link={ url }
			onNavigate={ ( event ) => continueInCalypso( url, event ) && onNavigate() }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			forceInternalLink={ ! isHappychatSessionActive && ! isJetpackNonAtomicSite }
			className={ isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent' }
		>
			<MySitesSidebarUnifiedStatsSparkline slug={ slug } />
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	count: PropTypes.number,
	icon: PropTypes.string,
	sectionId: PropTypes.string,
	slug: PropTypes.string,
	title: PropTypes.string,
	url: PropTypes.string,
	isHappychatSessionActive: PropTypes.bool.isRequired,
	isJetpackNonAtomicSite: PropTypes.bool.isRequired,
	continueInCalypso: PropTypes.func.isRequired,
};

export default memo( MySitesSidebarUnifiedItem );
