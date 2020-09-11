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

const blankSvg =
	"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
const blankSvgStyle = { height: '24px', width: '24px' };

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
	} else {
		// Demo workaround for items missing icons
		// TODO: Change sidebar__menu-icon to sidebar-unified__menu-icon (See above)
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		customIcon = (
			<img src={ blankSvg } style={ blankSvgStyle } className="sidebar__menu-icon" alt="" />
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
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
			label={ title }
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
