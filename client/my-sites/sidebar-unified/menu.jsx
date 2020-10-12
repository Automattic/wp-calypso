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

/**
 * Internal dependencies
 */
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import {
	toggleMySitesSidebarSection as toggleSection,
	expandMySitesSidebarSection as expandSection,
} from 'state/my-sites/sidebar/actions';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import MySitesSidebarUnifiedItem from './item';
import SidebarCustomIcon from 'layout/sidebar/custom-icon';
import { isExternal } from 'lib/url';
import { externalRedirect } from 'lib/route/path';
import { itemLinkMatches } from '../sidebar/utils';

export const MySitesSidebarUnifiedMenu = ( {
	slug,
	title,
	icon,
	children,
	path,
	link,
	selected,
} ) => {
	const hasAutoExpanded = useRef( false );
	const reduxDispatch = useDispatch();
	const sectionId = 'SIDEBAR_SECTION_' + slug;
	const isExpanded = useSelector( ( state ) => isSidebarSectionOpen( state, sectionId ) );
	const selectedMenuItem =
		children && children.find( ( menuItem ) => itemLinkMatches( menuItem.url, path ) );
	const childIsSelected = !! selectedMenuItem;

	/**
	 * One time only, auto-expand the currently active section, or the section
	 * which contains the current active item.
	 */
	useEffect( () => {
		if ( ! hasAutoExpanded.current && ( selected || childIsSelected ) ) {
			reduxDispatch( expandSection( sectionId ) );
			hasAutoExpanded.current = true;
		}
	}, [ selected, childIsSelected, reduxDispatch, sectionId ] );

	return (
		<ExpandableSidebarMenu
			onClick={ () => {
				if ( link ) {
					if ( isExternal( link ) ) {
						// If the URL is external, page() will fail to replace state between different domains
						externalRedirect( link );
						return;
					}
					page( link );
				}
				reduxDispatch( toggleSection( sectionId ) );
			} }
			expanded={ isExpanded || selected }
			title={ title }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			className={ ( selected || childIsSelected ) && 'sidebar__menu--selected' }
		>
			{ children.map( ( item ) => {
				const isSelected = selectedMenuItem?.url === item.url;
				return (
					<MySitesSidebarUnifiedItem
						key={ item.slug }
						path={ path }
						{ ...item }
						selected={ isSelected }
						isSubItem={ true }
					/>
				);
			} ) }
		</ExpandableSidebarMenu>
	);
};

MySitesSidebarUnifiedMenu.propTypes = {
	path: PropTypes.string,
	slug: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	children: PropTypes.array.isRequired,
	link: PropTypes.string,
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
