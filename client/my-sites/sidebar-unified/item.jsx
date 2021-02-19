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
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';
import {
	collapseAllMySitesSidebarSections,
	expandMySitesSidebarSection,
} from 'calypso/state/my-sites/sidebar/actions';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';

export const MySitesSidebarUnifiedItem = ( {
	count,
	icon,
	isSubItem = false,
	sectionId,
	selected = false,
	slug,
	title,
	url,
	continueInCalypso,
} ) => {
	const reduxDispatch = useDispatch();
	const isHappychatSessionActive = useSelector( ( state ) => hasActiveHappychatSession( state ) );

	const onNavigate = () => {
		reduxDispatch( collapseAllMySitesSidebarSections() );
		reduxDispatch( expandMySitesSidebarSection( sectionId ) );
	};

	return (
		<SidebarItem
			count={ count }
			label={ title }
			link={ url }
			onNavigate={ ( event ) => continueInCalypso( url, event ) && onNavigate() }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			forceInternalLink={ ! isHappychatSessionActive }
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
};

export default memo( MySitesSidebarUnifiedItem );
