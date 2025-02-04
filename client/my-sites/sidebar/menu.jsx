/**
 * MySitesSidebarUnifiedMenu
 *
 * Renders a top level menu item with children.
 * This item can be expanded and collapsed by clicking.
 */

import { isWooExpressPlan, PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isWithinBreakpoint } from '@automattic/viewport';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { toggleMySitesSidebarSection as toggleSection } from 'calypso/state/my-sites/sidebar/actions';
import { isSidebarSectionOpen } from 'calypso/state/my-sites/sidebar/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	isUnifiedSiteSidebarVisible,
	...props
} ) => {
	const reduxDispatch = useDispatch();
	const sectionId = 'SIDEBAR_SECTION_' + slug;
	const isExpanded = useSelector( ( state ) => isSidebarSectionOpen( state, sectionId ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, selectedSiteId ) );
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

	const trackClickEvent = ( _link ) => {
		// For now, we only track clicks on the Plans menu item for WooExpress sites.
		const isEcommerceTrial = sitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		if ( ! isEcommerceTrial && ! isWooExpressPlan( sitePlanSlug ) ) {
			return;
		}

		if ( typeof _link !== 'string' || ! _link.startsWith( '/plans/' ) ) {
			return;
		}

		// Check if we're navigating to /plans/:siteSlug or some deeper path below /plans/[something]/siteSlug
		// The implementation can be changed to be simpler or different, but the check is needed.
		const hasDeeperPath = _link.replace( '/plans/', '' ).includes( '/' );
		if ( hasDeeperPath ) {
			return;
		}

		// Note that we also track this event in WooCommerce Screen via wc-calypso-bridge. If you change this event, please update it there as well. See: https://github.com/Automattic/wc-calypso-bridge/pull/1156.
		reduxDispatch(
			recordTracksEvent( 'calypso_sidebar_item_click', {
				path: '/plans',
			} )
		);
	};

	const onClick = ( event ) => {
		// Block the navigation on mobile viewports and just toggle the section,
		// since we don't show the child items on hover and users should have a
		// chance to see them.
		if ( isMobile ) {
			event?.preventDefault();
			reduxDispatch( toggleSection( sectionId ) );
			return;
		}

		trackClickEvent( link );
		window.scrollTo( 0, 0 );
		reduxDispatch( toggleSection( sectionId ) );
	};

	const shouldForceShowExternalIcon = ( item ) => {
		if ( ! isUnifiedSiteSidebarVisible ) {
			return false;
		}
		return item?.parent === 'jetpack' && item?.url?.startsWith( 'https://jetpack.com' );
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
				hideExpandableIcon
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
							trackClickEvent={ trackClickEvent }
							isSubItem
							shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
							forceShowExternalIcon={ shouldForceShowExternalIcon( item ) }
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
