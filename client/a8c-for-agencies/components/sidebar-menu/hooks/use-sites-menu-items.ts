import config from '@automattic/calypso-config';
import { category, code, starEmpty, tool, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
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
	const noActiveSite = useNoActiveSite();
	const { data } = useFetchPendingSites();
	const totalAvailableSites =
		data?.filter(
			( { features }: { features: { wpcom_atomic: { state: string; license_key: string } } } ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		).length || 0;
	const shouldAddNeedsSetup = totalAvailableSites > 0;
	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

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
					menu_item: 'Automattic for Agencies / Sites / Needs Attention',
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

			if ( devSitesEnabled ) {
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
			}

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

		return items.map( ( item ) => createItem( item, path ) );
	}, [ noActiveSite, path, translate, shouldAddNeedsSetup, devSitesEnabled ] );
};
export default useSitesMenuItems;
