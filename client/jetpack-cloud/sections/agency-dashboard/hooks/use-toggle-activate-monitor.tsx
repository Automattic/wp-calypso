import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext } from 'react';
import { getSelectedFilters } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/get-selected-filters';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { setSiteMonitorStatus } from 'calypso/state/jetpack-agency-dashboard/actions';
import useToggleActivateMonitorMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-toggle-activate-monitor-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from '../sites-overview/context';
import getRejectedAndFulfilledRequests from './get-rejected-and-fulfilled-requests-util';
import type { Site } from '../sites-overview/types';

const NOTIFICATION_DURATION = 3000;
const DEFAULT_CHECK_INTERVAL = 5;

export default function useToggleActivateMonitor(
	sites: Array< Site >
): ( isEnabled: boolean ) => void {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryClient = useQueryClient();
	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );

	const { dataViewsState, showOnlyFavorites, showOnlyDevelopmentSites } =
		useContext( SitesDashboardContext );

	const agencyId = useSelector( getActiveAgencyId );

	const queryKey = isA8CForAgencies()
		? [
				'jetpack-agency-dashboard-sites',
				dataViewsState.search,
				dataViewsState.page,
				{
					issueTypes: getSelectedFilters( dataViewsState.filters ),
					showOnlyFavorites: showOnlyFavorites || false,
					showOnlyDevelopmentSites: showOnlyDevelopmentSites || false,
				},
				dataViewsState.sort,
				dataViewsState.perPage,
				...( agencyId ? [ agencyId ] : [] ),
		  ]
		: [
				'jetpack-agency-dashboard-sites',
				search,
				currentPage,
				filter,
				sort,
				...( agencyId ? [ agencyId ] : [] ),
		  ];

	const toggleActivateMonitoring = useToggleActivateMonitorMutation( {
		onMutate: async ( { siteId } ) => {
			dispatch( setSiteMonitorStatus( siteId, 'loading' ) );
		},
		onSuccess: async ( _data, { siteId, params } ) => {
			// Cancel any current refetches, so they don't overwrite our update
			await queryClient.cancelQueries( {
				queryKey,
			} );
			// Update to the new value
			// If there are issues with updating the query data, check if queryKey is the same
			// as in client/data/agency-dashboard/use-fetch-dashboard-sites.ts
			await queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites?.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								monitor_active: params.monitor_active,
								monitor_settings: {
									...site.monitor_settings,
									monitor_active: params.monitor_active,
									check_interval: site.monitor_settings?.check_interval ?? DEFAULT_CHECK_INTERVAL,
									// As we rely primarily on the monitor_site_status field to determine the status of the monitor,
									// we need to update it when the monitor_active field is updated.
									monitor_site_status: params.monitor_active,
								},
							};
						}
						return site;
					} ),
				};
			} );
		},
		onSettled: async ( _data, _error, { siteId } ) => {
			dispatch( setSiteMonitorStatus( siteId, 'completed' ) );
		},
		retry: ( errorCount ) => {
			if ( sites.length > 1 ) {
				return false;
			}
			return errorCount < 3;
		},
	} );

	const toggle = useCallback(
		async ( isEnabled: boolean ) => {
			const params = {
				monitor_active: isEnabled,
			};
			const requests: any = [];
			sites.forEach( ( site ) =>
				requests.push( {
					site,
					mutation: toggleActivateMonitoring.mutateAsync( {
						siteId: site.blog_id,
						params,
						hasJetpackPluginInstalled: site?.enabled_plugin_slugs?.includes( 'jetpack' ) ?? false,
					} ),
				} )
			);
			const promises = await Promise.allSettled(
				requests.map( ( request: { mutation: any } ) => request.mutation )
			);

			const { fulfilledRequests, rejectedRequests } = getRejectedAndFulfilledRequests(
				promises,
				requests
			);

			const totalFulfilled = fulfilledRequests.length;
			const totalRejected = rejectedRequests.length;

			const components = {
				em: <em />,
			};

			if ( totalFulfilled ) {
				const monitorStatus = isEnabled ? translate( 'resumed' ) : translate( 'paused' );
				let successMessage;
				if ( totalFulfilled > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalFulfilled },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					successMessage = translate(
						'Successfully %(monitorStatus)s the monitor for %(siteCountText)s.',
						{
							args: { monitorStatus, siteCountText },
							comment:
								"%(monitorStatus)s is the monitor's currently set status which could be either 'resumes' or 'paused'. %(siteCountText) is no of sites, e.g. '2 sites'",
							components,
						}
					);
				} else {
					const siteUrl = fulfilledRequests[ 0 ].site.url;
					successMessage = translate(
						'Successfully %(monitorStatus)s the monitor for {{em}}%(siteUrl)s{{/em}}.',
						{
							args: { monitorStatus, siteUrl },
							comment:
								"%(monitorStatus)s is the monitor's currently set status which could be either 'resumed' or 'paused'",
							components,
						}
					);
				}
				dispatch( successNotice( successMessage, { duration: NOTIFICATION_DURATION } ) );
			}

			if ( totalRejected ) {
				let errorMessage;
				const monitorStatus = isEnabled ? translate( 'resume' ) : translate( 'pause' );
				if ( totalRejected > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalRejected },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					errorMessage = translate(
						'Sorry, something went wrong when trying to %(monitorStatus)s the monitor for %(siteCountText)s. Please try again.',
						{
							args: { monitorStatus, siteCountText },
							comment:
								"%(monitorStatus)s is the monitor's currently set activation status which could be either 'resume' or 'pause'. %(siteCountText) is no of sites, e.g. '2 sites'",
							components,
						}
					);
				} else {
					const siteUrl = rejectedRequests[ 0 ].site.url;
					errorMessage = translate(
						'Sorry, something went wrong when trying to %(monitorStatus)s the monitor for {{em}}%(siteUrl)s{{/em}}. Please try again.',
						{
							args: { monitorStatus, siteUrl },
							comment:
								"%(monitorStatus)s is the monitor's currently set activation status which could be either 'resume' or 'pause'",
							components,
						}
					);
				}
				dispatch( errorNotice( errorMessage, { duration: NOTIFICATION_DURATION } ) );
			}
		},
		[ dispatch, sites, toggleActivateMonitoring, translate ]
	);

	return toggle;
}
