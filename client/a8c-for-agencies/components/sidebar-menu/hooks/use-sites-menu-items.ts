import { isEnabled } from '@automattic/calypso-config';
import { category, starEmpty, tool, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import {
	A4A_SITES_LINK,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_NEEDS_ATTENTION,
	A4A_SITES_LINK_NEEDS_SETUP,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useSitesMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const noActiveSite = useNoActiveSite();
	const isWPCOMPurchaseOptionEnabled = isEnabled(
		'a8c-for-agencies/wpcom-creator-plan-purchase-flow'
	);
	const { data } = useFetchPendingSites();
	const totalAvailableSites =
		data?.filter(
			( { features }: { features: { wpcom_atomic: { state: string; license_key: string } } } ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		).length || 0;
	const shouldAddNeedsSetup = isWPCOMPurchaseOptionEnabled && totalAvailableSites > 0;

	return useMemo( () => {
		if ( noActiveSite ) {
			// We hide the rest of the options when we do not have sites yet.
			return [
				createItem(
					{
						id: 'sites-all-menu-item',
						icon: category,
						path: A4A_SITES_LINK,
						link: A4A_SITES_LINK,
						title: translate( 'All' ),
						trackEventProps: {
							menu_item: 'Automattic for Agencies / Sites / All',
						},
					},
					path
				),
			];
		}

		const items = [
			{
				icon: warning,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK_NEEDS_ATTENTION,
				title: translate( 'Needs attention' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / Needs Attention',
				},
			},
			{
				icon: starEmpty,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK_FAVORITE,
				title: translate( 'Favorites' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / Favorites',
				},
			},
			{
				id: 'sites-all-menu-item',
				icon: category,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK,
				title: translate( 'All' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / All',
				},
			},
		].map( ( item ) => createItem( item, path ) );

		if ( shouldAddNeedsSetup ) {
			const needsSetupItem = createItem(
				{
					icon: tool,
					path: A4A_SITES_LINK,
					link: A4A_SITES_LINK_NEEDS_SETUP,
					title: translate( 'Needs setup' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Sites / Needs Setup',
					},
				},
				path
			);
			items.splice( 1, 0, needsSetupItem );
		}

		return items;
	}, [ noActiveSite, path, translate, shouldAddNeedsSetup ] );
};
export default useSitesMenuItems;
