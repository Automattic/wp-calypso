/**
 * MySitesSidebarUnifiedMenu
 *
 * Renders a top level menu item with children.
 * This item can be expanded and collapsed by clicking.
 */

import { isWithinBreakpoint } from '@automattic/viewport';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import { toggleMySitesSidebarSection as toggleSection } from 'calypso/state/my-sites/sidebar/actions';
import { isSidebarSectionOpen } from 'calypso/state/my-sites/sidebar/selectors';
import MySitesSidebarUnifiedItem from './item';
import { itemLinkMatches } from './utils';

export const MySitesSidebarUnifiedMenu = ( {
	count,
	slug,
	title,
	icon,
	children,
	path,
	link,
	selected,
	sidebarCollapsed,
	shouldOpenExternalLinksInCurrentTab,
	canNavigate,
	...props
} ) => {
	const reduxDispatch = useDispatch();
	const sectionId = 'SIDEBAR_SECTION_' + slug;
	const isExpanded = useSelector( ( state ) => isSidebarSectionOpen( state, sectionId ) );
	const selectedMenuItem =
		Array.isArray( children ) &&
		children.find( ( menuItem ) => menuItem?.url && itemLinkMatches( menuItem.url, path ) );
	const childIsSelected = !! selectedMenuItem;
	const isDesktop = isWithinBreakpoint( '>782px' );
	const isMobile = ! isDesktop;
	const showAsExpanded =
		( isMobile && ( childIsSelected || isExpanded ) ) || // For mobile breakpoints, we dont' care about the sidebar collapsed status.
		( isDesktop && childIsSelected && ! sidebarCollapsed ); // For desktop breakpoints, a child should be selected and the sidebar being expanded.

	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	const onClick = ( event ) => {
		// Block the navigation on mobile viewports and just toggle the section,
		// since we don't show the child items on hover and users should have a
		// chance to see them.
		if ( isMobile ) {
			event?.preventDefault();
			reduxDispatch( toggleSection( sectionId ) );
			return;
		}

		if ( ! canNavigate( link ) ) {
			event?.preventDefault();
			return;
		}

		window.scrollTo( 0, 0 );
		reduxDispatch( toggleSection( sectionId ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				onClick={ onClick }
				expanded={ showAsExpanded }
				title={ title }
				customIcon={ <SidebarCustomIcon icon={ icon } /> }
				className={ ( selected || childIsSelected ) && 'sidebar__menu--selected' }
				count={ count }
				hideExpandableIcon={ true }
				inlineText={ props.inlineText }
				href={ link }
				{ ...props }
			>
				{ children.map( ( item ) => {
					if ( ! shouldShowAdvertisingOption && item?.url?.includes( '/advertising/' ) ) {
						return;
					}
					const isSelected = selectedMenuItem?.url === item.url;
					return (
						<MySitesSidebarUnifiedItem
							key={ item.title }
							{ ...item }
							selected={ isSelected }
							isSubItem={ true }
							shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
							canNavigate={ canNavigate }
						/>
					);
				} ) }
			</ExpandableSidebarMenu>
		</li>
	);
};

MySitesSidebarUnifiedMenu.propTypes = {
	count: PropTypes.number,
	path: PropTypes.string,
	slug: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	children: PropTypes.array.isRequired,
	link: PropTypes.string,
	sidebarCollapsed: PropTypes.bool,
	shouldOpenExternalLinksInCurrentTab: PropTypes.bool.isRequired,
	canNavigate: PropTypes.func.isRequired,
	/*
	Example of children shape:
	[
		{
			"title": "Settings",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		},
		{
			"title": "Domains",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		},
		{
			"title": "Debug Bar Extender",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		},
		{
			"title": "Hosting Configuration",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		}
	]
	*/
};

export default MySitesSidebarUnifiedMenu;
