import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext } from 'react';
import { useDispatch } from 'calypso/state';
import { setSiteMonitorStatus } from 'calypso/state/jetpack-agency-dashboard/actions';
import useToggleActivateMonitorMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-toggle-activate-monitor-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from '../sites-overview/context';
import getRejectedAndFulfilledRequests from './get-rejected-and-fulfilled-requests-util';
import type { Site } from '../sites-overview/types';

const NOTIFICATION_DURATION = 3000;

export default function useToggleActivateMonitor(
	sites: Array< { blog_id: number; url: string } >
): ( isEnabled: boolean ) => void {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryClient = useQueryClient();
	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];

	const toggleActivateMonitoring = useToggleActivateMonitorMutation( {
		onMutate: async ( { siteId } ) => {
			dispatch( setSiteMonitorStatus( siteId, 'loading' ) );
		},
		onSuccess: async ( _data, { siteId, params } ) => {
			// Cancel any current refetches, so they don't overwrite our update
			await queryClient.cancelQueries( {
				queryKey: queryKey,
			} );

			// Update to the new value
			queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								monitor_settings: {
									...site.monitor_settings,
									monitor_active: params.monitor_active,
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
					mutation: toggleActivateMonitoring.mutateAsync( { siteId: site.blog_id, params } ),
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
