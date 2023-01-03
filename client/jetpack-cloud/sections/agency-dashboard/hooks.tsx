import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from './sites-overview/context';
import type { Site } from './sites-overview/types';

export function useToggleActivateMonitor( {
	blog_id: siteId,
	url: siteUrl,
}: {
	blog_id: number;
	url: string;
} ): [ ( isEnabled: boolean ) => void, boolean ] {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const components = {
		em: <em />,
	};

	const toggleActivateMonitoring = useUpdateMonitorSettingsMutation( {
		onSuccess: ( _data, arg ) => {
			const isEnabled = arg.params.monitor_active;
			const status = isEnabled ? translate( 'activate' ) : translate( 'deactivate' );
			const successMessage = translate(
				'A request to %(status)s the monitor for {{em}}%(siteUrl)s{{/em}} was made successfully. ' +
					'Please allow a few minutes for it to %(status)s.',
				{
					args: { status, siteUrl },
					comment:
						"%(status)s is the monitor's currently set activation status which could be either 'activate' or 'deactivate'",
					components,
				}
			);
			dispatch( successNotice( successMessage ) );
		},
		onError: ( _error, arg ) => {
			const isEnabled = arg.params.monitor_active;
			const status = isEnabled ? translate( 'activate' ) : translate( 'deactivate' );
			const errorMessage = translate(
				'Sorry, something went wrong when trying to %(status)s monitor for {{em}}%(siteUrl)s{{/em}}. Please try again.',
				{
					args: { status, siteUrl },
					comment:
						"%(status)s is the monitor's currently set activation status which could be either 'activate' or 'deactivate'",
					components,
				}
			);
			dispatch( errorNotice( errorMessage, { isPersistent: true } ) );
		},
		retry: ( errorCount ) => {
			return errorCount < 3;
		},
	} );

	const toggle = useCallback(
		( isEnabled: boolean ) => {
			const params = {
				monitor_active: isEnabled,
			};
			toggleActivateMonitoring.mutate( { siteId, params } );
		},
		[ siteId, toggleActivateMonitoring ]
	);

	return [ toggle, toggleActivateMonitoring.isLoading ];
}

export function useUpdateMonitorSettings( sites: Array< { blog_id: number; url: string } > ): {
	updateMonitorSettings: ( params: object ) => void;
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

			const allSelectedSites: {
				site: { blog_id: number; url: string };
				status: 'rejected' | 'fulfilled';
			}[] = [];

			promises.forEach( ( promise: any, index: number ) => {
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
			const rejectedRequests = allSelectedSites.filter(
				( product ) => product.status === 'rejected'
			);

			const totalFulfilled = fulfilledRequests.length;
			const totalRejected = rejectedRequests.length;

			const components = {
				em: <em />,
			};

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
