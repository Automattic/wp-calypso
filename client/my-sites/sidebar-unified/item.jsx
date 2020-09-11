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
import { getSelectedSiteId } from 'state/ui/selectors';
import SidebarItem from 'layout/sidebar/item';
import SidebarCustomIcon from 'layout/sidebar/custom-icon';
import StatsSparkline from 'blocks/stats-sparkline';

const onNav = () => null;

// selected={ itemLinkMatches( [ '/domains', '/email' ], path ) }

const blankSvg =
	"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
const blankSvgStyle = { height: '24px', width: '24px' };

export const MySitesSidebarUnifiedItem = ( { title, icon, url, path, slug, isTopLevel } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selected = path === url;
	let customIcon = null;
	if ( icon && typeof icon === 'string' && icon.match( /data:image/ ) ) {
		customIcon = <SidebarCustomIcon src={ icon } />;
	} else if ( isTopLevel ) {
		customIcon = <SidebarCustomIcon crc={ blankSvg } style={ blankSvgStyle } />;
	}

	let children = null;

	// "Stats" item has sparkline inside of it
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );
	if ( isStats && selectedSiteId ) {
		// TODO: Change sidebar__menu-icon to sidebar-unified__menu-icon and
		// copy the CSS rules
		// eslint-disable-next-line
		children = <StatsSparkline className="sidebar__sparkline" siteId={ selectedSiteId } />;
	}

	return (
		<SidebarItem
			label={ title }
			link={ url }
			onNavigate={ onNav }
			selected={ selected }
			customIcon={ customIcon }
		>
			{ children }
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	isTopLevel: PropTypes.bool,
	path: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	url: PropTypes.string,
};

export default MySitesSidebarUnifiedItem;
