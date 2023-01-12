import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { setSiteMonitorStatus } from 'calypso/state/jetpack-agency-dashboard/actions';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from './sites-overview/context';
import type { Site, UpdateMonitorSettingsParams } from './sites-overview/types';

function getRejectedAndFulfilledRequests(
	promises: any[],
	requests: { site: { blog_id: number; url: string } }[]
) {
	const allSelectedSites: {
		site: { blog_id: number; url: string };
		status: 'rejected' | 'fulfilled';
	}[] = [];

	promises.forEach( ( promise, index ) => {
		const { status } = promise;
		const site = requests[ index ].site;
		const item = {
			site,
			status,
		};
		allSelectedSites.push( item );
	} );

	const fulfilledRequests = allSelectedSites.filter(
		( product ) => product.status === 'fulfilled'
	);
	const rejectedRequests = allSelectedSites.filter( ( product ) => product.status === 'rejected' );

	return { fulfilledRequests, rejectedRequests };
}

export function useToggleActivateMonitor(
	sites: Array< { blog_id: number; url: string } >
): ( isEnabled: boolean ) => void {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryClient = useQueryClient();
	const { filter, search, currentPage } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter ];

	const toggleActivateMonitoring = useUpdateMonitorSettingsMutation( {
		onMutate: async ( { siteId } ) => {
			dispatch( setSiteMonitorStatus( siteId, 'loading' ) );
		},
		onSuccess: async ( data, { siteId } ) => {
			// Cancel any current refetches, so they don't overwrite our update
			await queryClient.cancelQueries( queryKey );

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
									monitor_active: data.settings.monitor_active,
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
				dispatch( successNotice( successMessage ) );
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
				dispatch( errorNotice( errorMessage ) );
			}
		},
		[ dispatch, sites, toggleActivateMonitoring, translate ]
	);

	return toggle;
}

export function useUpdateMonitorSettings( sites: Array< { blog_id: number; url: string } > ): {
	updateMonitorSettings: ( params: UpdateMonitorSettingsParams ) => void;
	isLoading: boolean;
	isComplete: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { filter, search, currentPage } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter ];

	const [ status, setStatus ] = useState( 'idle' );

	const updateMonitorSettings = useUpdateMonitorSettingsMutation( {
		onSuccess: async ( data, { siteId } ) => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( queryKey );

			// Optimistically update to the new value
			queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								monitor_settings: {
									...site.monitor_settings,
									monitor_deferment_time: data.settings.jetmon_defer_status_down_minutes,
									email_notifications: data.settings.email_notifications,
									wp_note_notifications: data.settings.wp_note_notifications,
								},
							};
						}
						return site;
					} ),
				};
			} );
		},
	} );

	const update = useCallback(
		async ( params ) => {
			setStatus( 'loading' );

			const requests: any = [];
			sites.forEach( ( site ) =>
				requests.push( {
					site,
					mutation: updateMonitorSettings.mutateAsync( { siteId: site.blog_id, params } ),
				} )
			);
			const promises = await Promise.allSettled(
				requests.map( ( request: { mutation: any } ) => request.mutation )
			);

			setStatus( 'completed' );

			const components = {
				em: <em />,
			};

			const { fulfilledRequests, rejectedRequests } = getRejectedAndFulfilledRequests(
				promises,
				requests
			);

			const totalFulfilled = fulfilledRequests.length;
			const totalRejected = rejectedRequests.length;

			if ( totalFulfilled ) {
				let successMessage;
				if ( totalFulfilled > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalFulfilled },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					successMessage = translate(
						'Successfully updated the monitor settings for %(siteCountText)s.',
						{
							args: { siteCountText },
							comment: '%(siteCountText) is no of sites, e.g. "2 sites"',
							components,
						}
					);
				} else {
					const siteUrl = fulfilledRequests[ 0 ].site.url;
					successMessage = translate(
						'Successfully updated the monitor settings for {{em}}%(siteUrl)s{{/em}}.',
						{
							args: { siteUrl },

							components,
						}
					);
				}
				dispatch( successNotice( successMessage ) );
			}

			if ( totalRejected ) {
				let errorMessage;
				if ( totalRejected > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalRejected },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					errorMessage = translate(
						'Sorry, something went wrong when trying to update monitor settings for %(siteCountText)s. Please try again.',
						{
							args: { siteCountText },
							comment: '%(siteCountText) is no of sites, e.g. "2 sites"',
							components,
						}
					);
				} else {
					const siteUrl = rejectedRequests[ 0 ].site.url;
					errorMessage = translate(
						'Sorry, something went wrong when trying to update monitor settings for {{em}}%(siteUrl)s{{/em}}. Please try again.',
						{
							args: { siteUrl },
							components,
						}
					);
				}
				dispatch( errorNotice( errorMessage ) );
			}
		},
		[ dispatch, sites, translate, updateMonitorSettings ]
	);

	return {
		updateMonitorSettings: update,
		isLoading: status === 'loading',
		isComplete: status === 'completed',
	};
}
