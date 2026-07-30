import {
	category,
	chartBar,
	code,
	starEmpty,
	tool,
	cautionFilled as warning,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import { isPathAllowed } from 'calypso/a8c-for-agencies/lib/permission';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_SITES_LINK,
	A4A_SITES_LINK_DEVELOPMENT,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_NEEDS_ATTENTION,
	A4A_SITES_LINK_NEEDS_SETUP,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useSitesMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const noActiveSite = useNoActiveSite();
	// Mirrors the guard in the sites section: without it `/sites/reports` falls through to the
	// `/sites/:category` catch-all and renders the sites dashboard instead.
	const isReportsAllowed =
		isSectionNameEnabled( 'a8c-for-agencies-reports' ) && isPathAllowed( A4A_REPORTS_LINK, agency );
	const { data } = useFetchPendingSites();
	const totalAvailableSites =
		data?.filter(
			( { features }: { features: { wpcom_atomic: { state: string; license_key: string } } } ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		).length || 0;
	const shouldAddNeedsSetup = totalAvailableSites > 0;
	return useMemo( () => {
		const items = [
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
		];

		// Only add additional menu items if we have an active site.
		if ( ! noActiveSite ) {
			items.push( {
				id: 'sites-needs-attention-menu-item',
				icon: warning,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK_NEEDS_ATTENTION,
				title: translate( 'Needs attention' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / Needs attention',
				},
			} );

			if ( shouldAddNeedsSetup ) {
				items.push( {
					id: 'sites-needs-setup-menu-item',
					icon: tool,
					path: A4A_SITES_LINK,
					link: A4A_SITES_LINK_NEEDS_SETUP,
					title: translate( 'Needs setup' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Sites / Needs Setup',
					},
				} );
			}

			items.push( {
				id: 'sites-development-menu-item',
				icon: code,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK_DEVELOPMENT,
				title: translate( 'Development' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / Development',
				},
			} );

			items.push( {
				id: 'sites-favorites-menu-item',
				icon: starEmpty,
				path: A4A_SITES_LINK,
				link: A4A_SITES_LINK_FAVORITE,
				title: translate( 'Favorites' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Sites / Favorites',
				},
			} );
		}

		const reportsItems = isReportsAllowed
			? [
					{
						id: 'sites-reports-menu-item',
						icon: chartBar,
						path: A4A_SITES_LINK,
						link: A4A_REPORTS_LINK,
						title: translate( 'Reports' ),
						badge: translate( 'Beta' ),
						trackEventProps: {
							menu_item: 'Automattic for Agencies / Sites / Reports',
						},
						withChevron: true,
					},
			  ]
			: [];

		return [ ...items, ...reportsItems ].map( ( item ) => createItem( item, path ) );
	}, [ isReportsAllowed, noActiveSite, path, translate, shouldAddNeedsSetup ] );
};
export default useSitesMenuItems;
