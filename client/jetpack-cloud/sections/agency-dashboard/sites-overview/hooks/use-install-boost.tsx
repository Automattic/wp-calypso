import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { DASHBOARD_SITES_QUERY_KEY } from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useInstallPluginMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-install-plugin-mutation';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import type { Site } from '../types';

// The sites list is keyed on the active search/filters/pagination, and each cached page holds
// its own copy of the site — so match every cached sites query by key prefix instead of trying
// to rebuild the exact key of whichever one the dashboard happens to be rendering.
const SITES_QUERY_FILTERS = { queryKey: [ DASHBOARD_SITES_QUERY_KEY ] };

type CachedSitesPage = { sites?: Site[] };

export default function useInstallBoost(
	siteId: number,
	siteUrl: string
): {
	installBoost: () => void;
	status: string;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agency = useSelector( getActiveAgency );
	const agencyId = agency ? agency.id : undefined;

	const handleUpdateSites = useCallback( async () => {
		// Cancel any current refetches, so they don't overwrite our update
		await queryClient.cancelQueries( SITES_QUERY_FILTERS );

		// Update to the new value
		queryClient.setQueriesData< CachedSitesPage >( SITES_QUERY_FILTERS, ( oldSites ) => {
			if ( ! oldSites?.sites ) {
				return oldSites;
			}

			return {
				...oldSites,
				sites: oldSites.sites.map( ( site ) => {
					if ( site.blog_id === siteId ) {
						return {
							...site,
							has_pending_boost_one_time_score: true,
						};
					}
					return site;
				} ),
			};
		} );
	}, [ queryClient, siteId ] );

	const { mutate: installPlugin, status } = useInstallPluginMutation( {
		retry: false,
	} );

	const installBoost = () => {
		installPlugin( {
			site_id: siteId,
			plugin_slug: 'jetpack_boost',
			agency_id: agencyId,
		} );
	};

	useEffect( () => {
		if ( status === 'success' ) {
			dispatch(
				successNotice(
					translate(
						'Jetpack Boost was successfully added to {{em}}%(siteUrl)s{{/em}}. Please allow a few minutes for performance score calculation.',
						{
							args: { siteUrl },
							comment: '%(siteUrl)s is the site url. Eg: example.com',
							components: {
								em: <em />,
							},
						}
					)
				)
			);
			handleUpdateSites();
		}
		if ( status === 'error' ) {
			dispatch(
				errorNotice( translate( 'Something went wrong while installing Boost. Please try again.' ) )
			);
		}
	}, [ dispatch, handleUpdateSites, status, siteUrl, translate ] );

	return {
		installBoost,
		status,
	};
}
