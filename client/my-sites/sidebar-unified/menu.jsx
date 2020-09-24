/**
 * MySitesSidebarUnifiedMenu
 *
 * Renders a top level menu item with children.
 * This item can be expanded and collapsed by clicking.
 **/

/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import { toggleMySitesSidebarSection as toggleSection } from 'state/my-sites/sidebar/actions';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import MySitesSidebarUnifiedItem from './item';
import SidebarCustomIcon from 'layout/sidebar/custom-icon';

export const MySitesSidebarUnifiedMenu = ( { slug, title, icon, children, path } ) => {
	const reduxDispatch = useDispatch();
	const sectionId = 'SIDEBAR_SECTION_' + slug;
	const isExpanded = useSelector( ( state ) => isSidebarSectionOpen( state, sectionId ) );

	return (
		<ExpandableSidebarMenu
			onClick={ () => reduxDispatch( toggleSection( sectionId ) ) }
			expanded={ isExpanded }
			title={ title }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
		>
			{ children.map( ( item ) => (
				<MySitesSidebarUnifiedItem key={ item.slug } path={ path } { ...item } />
			) ) }
		</ExpandableSidebarMenu>
	);
};

MySitesSidebarUnifiedMenu.propTypes = {
	path: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	children: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ).isRequired,
	/*
	Example of children shape (object):
	{
		"1": {
			"title": "Feedback",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		},
		"2": {
			"title": "Polls",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		},
		"3": {
			"title": "Ratings",
			"url": "https://wp.com",
			"icon": null,
			"type": "menu-item"
		}
	}

	Example of children shape (array):
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
