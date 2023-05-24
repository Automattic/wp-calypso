/**
 * MySitesSidebarUnifiedItem
 *
 * Renders a sidebar menu item with no child items.
 * This could be a top level item, or a child item nested under a top level menu.
 * These two cases might be to be split up?
 */

import { isWooExpressPlan, PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	shouldOpenExternalLinksInCurrentTab,
	canNavigate,
} ) => {
	const reduxDispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, selectedSiteId ) );

	const trackItemClick = () => {
		// For now, we only track clicks on the Plans menu item for WooExpress sites.
		const isEcommerceTrial = sitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		if ( ! isEcommerceTrial && ! isWooExpressPlan( sitePlanSlug ) ) {
			return;
		}

		if ( url.startsWith( '/plans/' ) ) {
			// Note that we also track this event in WooCommerce Screen via wc-calypso-bridge. If you change this event, please update it there as well. See: https://github.com/Automattic/wc-calypso-bridge/pull/1156.
			reduxDispatch(
				recordTracksEvent( 'calypso_sidebar_item_click', {
					path: '/plans',
				} )
			);
		}
	};

	const onNavigate = ( event ) => {
		if ( ! canNavigate( url ) ) {
			event?.preventDefault();
			return;
		}

		trackItemClick();
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
			className={ isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent' }
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
	canNavigate: PropTypes.func.isRequired,
};

export default memo( MySitesSidebarUnifiedItem );
