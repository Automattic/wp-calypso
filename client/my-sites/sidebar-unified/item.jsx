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
import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getSelectedSite } from 'state/ui/selectors';
import SidebarItem from 'layout/sidebar/item';
import StatsSparkline from 'blocks/stats-sparkline';

const onNav = () => null;

const removePrefix = ( str, prefix ) => {
	if ( str == null || typeof str !== 'string' ) {
		return str;
	}
	const hasPrefix = str.indexOf( prefix ) === 0;
	if ( ! hasPrefix ) {
		return str;
	}
	return str.substr( prefix.length );
};

// selected={ itemLinkMatches( [ '/domains', '/email' ], path ) }

export const MySitesSidebarUnifiedItem = ( { title, icon, url, path, slug } ) => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const fixedUrl = removePrefix( url, 'https://wordpress.com' );
	const selected = path === fixedUrl;
	let customIcon = null;
	if ( icon && typeof icon === 'string' && icon.match( /data:image/ ) ) {
		// TODO: Change sidebar__menu-icon to sidebar-unified__menu-icon and
		// copy the CSS rules
		// I would do now, but this will cause a conflict w/ the update/left-nav-geometries
		// branch
		// eslint-disable-next-line
		customIcon = <img src={ icon } className="sidebar__menu-icon" alt="" />;
	}

	let children = null;

	// "Stats" item has sparkline inside of it
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );
	if ( isStats && selectedSite && selectedSite.ID ) {
		// TODO: Change sidebar__menu-icon to sidebar-unified__menu-icon and
		// copy the CSS rules
		// eslint-disable-next-line
		children = <StatsSparkline className="sidebar__sparkline" siteId={ selectedSite.ID } />;
	}

	return (
		<SidebarItem
			label={ decodeEntities( title ) }
			link={ fixedUrl }
			onNavigate={ onNav }
			selected={ selected }
			customIcon={ customIcon }
		>
			{ children }
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	path: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	url: PropTypes.string,
};

export default MySitesSidebarUnifiedItem;
