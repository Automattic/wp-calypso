/**
 * MySitesSidebarUnifiedMenu
 *
 * Renders a top level menu item with children.
 * This item can be expanded and collapsed by clicking.
 **/

/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import page from 'page';
import { isWithinBreakpoint } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { isSidebarSectionOpen } from 'calypso/state/my-sites/sidebar/selectors';
import {
	toggleMySitesSidebarSection as toggleSection,
	expandMySitesSidebarSection as expandSection,
	collapseAllMySitesSidebarSections,
} from 'calypso/state/my-sites/sidebar/actions';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import MySitesSidebarUnifiedItem from './item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import { isExternal } from 'calypso/lib/url';
import { externalRedirect } from 'calypso/lib/route/path';
import { itemLinkMatches } from '../sidebar/utils';

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
	continueInCalypso,
} ) => {
	const hasAutoExpanded = useRef( false );
	const reduxDispatch = useDispatch();
	const sectionId = 'SIDEBAR_SECTION_' + slug;
	const isExpanded = useSelector( ( state ) => isSidebarSectionOpen( state, sectionId ) );

	const selectedMenuItem =
		Array.isArray( children ) &&
		children.find( ( menuItem ) => menuItem?.url && itemLinkMatches( menuItem.url, path ) );
	const childIsSelected = !! selectedMenuItem;

	/**
	 * One time only, auto-expand the currently active section, or the section
	 * which contains the current active item.
	 */
	useEffect( () => {
		if ( ! hasAutoExpanded.current && ( selected || childIsSelected ) && ! sidebarCollapsed ) {
			reduxDispatch( expandSection( sectionId ) );
			hasAutoExpanded.current = true;
		}
	}, [ selected, childIsSelected, reduxDispatch, sectionId, sidebarCollapsed ] );

	const onClick = () => {
		if ( isWithinBreakpoint( '>782px' ) ) {
			if ( link ) {
				if ( isExternal( link ) ) {
					// If the URL is external, page() will fail to replace state between different domains.
					externalRedirect( link );
					return;
				}

				// Only open the page if menu is NOT full-width, otherwise just open / close the section instead of directly redirecting to the section.
				page( link );
			}

			if ( ! sidebarCollapsed ) {
				// Keep only current submenu open.
				reduxDispatch( collapseAllMySitesSidebarSections() );
			}
		}

		reduxDispatch( toggleSection( sectionId ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				onClick={ () => continueInCalypso( link ) && onClick() }
				expanded={ ! sidebarCollapsed && isExpanded }
				title={ title }
				customIcon={ <SidebarCustomIcon icon={ icon } /> }
				className={ ( selected || childIsSelected ) && 'sidebar__menu--selected' }
				count={ count }
				hideExpandableIcon={ true }
			>
				{ children.map( ( item ) => {
					const isSelected = selectedMenuItem?.url === item.url;
					return (
						<MySitesSidebarUnifiedItem
							key={ item.title }
							{ ...item }
							selected={ isSelected }
							sectionId={ sectionId }
							isSubItem={ true }
							continueInCalypso={ continueInCalypso }
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
