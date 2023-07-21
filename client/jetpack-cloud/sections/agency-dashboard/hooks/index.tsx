import { useBreakpoint } from '@automattic/viewport-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext, useEffect, RefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	selectLicense,
	setSiteMonitorStatus,
	unselectLicense,
} from 'calypso/state/jetpack-agency-dashboard/actions';
import useToggleActivateMonitorMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-toggle-activate-monitor-mutation';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from '../sites-overview/context';
import type { AllowedTypes, Site, UpdateMonitorSettingsParams } from '../sites-overview/types';

const NOTIFICATION_DURATION = 3000;
const DESKTOP_BREAKPOINT = '>1280px';

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
	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];

	const toggleActivateMonitoring = useToggleActivateMonitorMutation( {
		onMutate: async ( { siteId } ) => {
			dispatch( setSiteMonitorStatus( siteId, 'loading' ) );
		},
		onSuccess: async ( _data, { siteId, params } ) => {
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

export function useUpdateMonitorSettings( sites: Array< { blog_id: number; url: string } > ): {
	updateMonitorSettings: ( params: UpdateMonitorSettingsParams ) => void;
	isLoading: boolean;
	isComplete: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];

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
									monitor_user_email_notifications: data.settings.email_notifications,
									monitor_user_sms_notifications: data.settings.sms_notifications,
									monitor_user_wp_note_notifications: data.settings.wp_note_notifications,
									monitor_notify_additional_user_emails: data.settings.contacts?.emails ?? [],
									monitor_notify_additional_user_sms: data.settings.contacts?.sms_numbers ?? [],
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
		async ( params: UpdateMonitorSettingsParams ) => {
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
				dispatch( successNotice( successMessage, { duration: NOTIFICATION_DURATION } ) );
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
				dispatch( errorNotice( errorMessage, { duration: NOTIFICATION_DURATION } ) );
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

export function useJetpackAgencyDashboardRecordTrackEvent(
	sites: Array< Site > | null,
	isLargeScreen?: boolean
) {
	const dispatch = useDispatch();

	const buildEventName = useCallback(
		( action: string ) =>
			`calypso_jetpack_agency_dashboard_${ action }_${
				isLargeScreen ? 'large_screen' : 'small_screen'
			}`,
		[ isLargeScreen ]
	);

	const buildSiteProperties = useCallback( () => {
		if ( ! sites?.length ) {
			return {};
		}
		if ( sites.length === 1 ) {
			const { blog_id, url } = sites[ 0 ];
			return {
				selected_site_id: blog_id,
				selected_site_url: url,
			};
		}
		return {
			selected_site_count: sites.length,
		};
	}, [ sites ] );

	const dispatchTrackingEvent = useCallback(
		( action: string, args = {} ) => {
			const name = buildEventName( action );

			const properties = {
				...buildSiteProperties(),
				...args,
			};
			dispatch( recordTracksEvent( name, properties ) );
		},
		[ buildEventName, buildSiteProperties, dispatch ]
	);

	return dispatchTrackingEvent;
}

export const useDashboardShowLargeScreen = (
	siteTableRef: RefObject< HTMLTableElement >,
	containerRef: { current: { clientWidth: number } }
) => {
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );

	const [ isOverflowing, setIsOverflowing ] = useState( false );

	const checkIfOverflowing = useCallback( () => {
		const siteTableEle = siteTableRef ? siteTableRef.current : null;

		if ( siteTableEle ) {
			if ( siteTableEle.clientWidth > containerRef?.current?.clientWidth ) {
				setTimeout( () => {
					setIsOverflowing( true );
				}, 1 );
			}
		}
	}, [ siteTableRef, containerRef ] );

	useEffect( () => {
		window.addEventListener( 'resize', checkIfOverflowing );
		return () => {
			window.removeEventListener( 'resize', checkIfOverflowing );
		};
	}, [ checkIfOverflowing ] );

	useEffect( () => {
		checkIfOverflowing();
		// Do not add checkIfOverflowing to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return isDesktop && ! isOverflowing;
};

export const useDashboardAddRemoveLicense = ( siteId: number, type: AllowedTypes ) => {
	const dispatch = useDispatch();

	const isLicenseSelected = useSelector( ( state ) =>
		hasSelectedLicensesOfType( state, siteId, type )
	);

	const handleAddLicenseAction = () => {
		isLicenseSelected
			? dispatch( unselectLicense( siteId, type ) )
			: dispatch( selectLicense( siteId, type ) );
	};

	return { isLicenseSelected, handleAddLicenseAction };
};

const TIMEOUT_DURATION = 10000;

export const useShowVerifiedBadge = () => {
	const [ verifiedItem, setVerifiedItem ] = useState< { [ key: string ]: string } | undefined >();

	const timeoutIdRef = useRef< ReturnType< typeof setTimeout > | undefined >();

	const handleSetVerifiedItem = useCallback(
		( type: string, item: string ) => {
			if ( verifiedItem ) {
				clearTimeout( timeoutIdRef.current );
			}
			setVerifiedItem( { [ type ]: item } );
			timeoutIdRef.current = setTimeout( () => {
				setVerifiedItem( undefined );
			}, TIMEOUT_DURATION );
		},
		[ verifiedItem ]
	);

	return { verifiedItem, handleSetVerifiedItem };
};
