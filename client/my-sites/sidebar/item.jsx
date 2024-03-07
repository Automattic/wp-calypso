/**
 * MySitesSidebarUnifiedItem
 *
 * Renders a sidebar menu item with no child items.
 * This could be a top level item, or a child item nested under a top level menu.
 * These two cases might be to be split up?
 */

import classnames from 'classnames';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useDispatch } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';

export const MySitesSidebarUnifiedItem = ( {
	badge,
	count,
	icon,
	isSubItem = false,
	selected = false,
	slug,
	title,
	url,
	className = '',
	shouldOpenExternalLinksInCurrentTab,
	forceExternalLink = false,
	forceShowExternalIcon = false,
	trackClickEvent,
} ) => {
	const reduxDispatch = useDispatch();

	const onNavigate = () => {
		if ( typeof trackClickEvent === 'function' ) {
			trackClickEvent( url );
		}

		reduxDispatch( collapseAllMySitesSidebarSections() );
		window.scrollTo( 0, 0 );
	};

	return (
		<SidebarItem
			badge={ badge }
			count={ count }
			label={ title }
			link={ url }
			onNavigate={ onNavigate }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			forceInternalLink={ shouldOpenExternalLinksInCurrentTab }
			forceExternalLink={ forceExternalLink }
			forceShowExternalIcon={ forceShowExternalIcon }
			className={ classnames(
				isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent',
				className
			) }
		>
			<MySitesSidebarUnifiedStatsSparkline slug={ slug } />
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	badge: PropTypes.string,
	count: PropTypes.number,
	icon: PropTypes.string,
	sectionId: PropTypes.string,
	slug: PropTypes.string,
	title: PropTypes.string,
	url: PropTypes.string,
	shouldOpenExternalLinksInCurrentTab: PropTypes.bool.isRequired,
	forceExternalLink: PropTypes.bool,
	forceShowExternalIcon: PropTypes.bool,
	trackClickEvent: PropTypes.func,
};

export default memo( MySitesSidebarUnifiedItem );
