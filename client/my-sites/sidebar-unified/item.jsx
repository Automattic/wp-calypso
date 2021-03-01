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
import {
	collapseAllMySitesSidebarSections,
	expandMySitesSidebarSection,
} from 'calypso/state/my-sites/sidebar/actions';
import { isExternal, addQueryArgs } from 'calypso/lib/url';

export const MySitesSidebarUnifiedItem = ( {
	count,
	icon,
	isSubItem = false,
	sectionId,
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
		reduxDispatch( expandMySitesSidebarSection( sectionId ) );
	};

	const getLink = () => {
		if ( ! isExternal( url ) ) {
			return url;
		}
		// In case of external links, let's add a `return` query arg so that we give
		// other interfaces ( eg WP Admin ) a chance to return us where we started from.
		return addQueryArgs( { return: document.location.href }, url );
	};

	return (
		<SidebarItem
			count={ count }
			label={ title }
			link={ getLink() }
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
