import { useTranslate } from 'i18n-calypso';
import { ReactChild, useCallback, useEffect, useState, useContext, RefObject } from 'react';
import acceptDialog from 'calypso/lib/accept';
import {
	useJetpackAgencyDashboardRecordTrackEvent,
	useToggleActivateMonitor,
	useUpdateMonitorSettings,
} from '../hooks';
import SitesOverviewContext from '../sites-overview/context';
import {
	availableNotificationDurations as durations,
	getSiteCountText,
} from '../sites-overview/utils';
import type { Site } from '../sites-overview/types';

const dialogContent = (
	heading: ReactChild,
	description: ReactChild,
	action: ( accepted: boolean ) => void
) => {
	const content = (
		<div>
			<div className="dashboard-bulk-actions-modal-heading">{ heading }</div>
			<span className="dashboard-bulk-actions-modal-desc">{ description }</span>
		</div>
	);
	const options = {
		additionalClassNames: 'dashboard-bulk-actions-modal',
	};
	return acceptDialog( content, action, heading, null, options );
};

export function useHandleToggleMonitor( selectedSites: Array< Site >, isLargeScreen?: boolean ) {
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( selectedSites );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( selectedSites, isLargeScreen );

	const toggleMonitor = useCallback(
		( accepted: boolean, activate: boolean ) => {
			if ( accepted ) {
				toggleActivateMonitor( activate );
				recordEvent( activate ? 'resume_monitor_save' : 'pause_monitor_save' );
			}
		},
		[ recordEvent, toggleActivateMonitor ]
	);

	const handleToggleActivateMonitor = useCallback(
		( activate: boolean ) => {
			const heading = activate ? translate( 'Resume Monitor' ) : translate( 'Pause Monitor' );
			const monitorAction = activate ? translate( 'resume' ) : translate( 'pause' );
			const siteCountText = getSiteCountText( selectedSites );
			const content =
				selectedSites.length > 1
					? translate( 'You are about to %(monitorAction)s the monitor for %(siteCountText)s.', {
							args: { monitorAction, siteCountText },
							comment:
								"%(monitorAction)s is the monitor's currently performed action which could be either 'resume' or 'pause'. %(siteCountText) is no of sites, e.g. '2 sites'",
					  } )
					: translate(
							'You are about to %(monitorAction)s the monitor for {{em}}%(siteUrl)s{{/em}}.',
							{
								args: { monitorAction, siteUrl: siteCountText },
								comment:
									"%(monitorAction)s is the monitor's currently performed action which could be either 'resume' or 'pause'.",
								components: {
									em: <em />,
								},
							}
					  );

			return dialogContent( heading, content, ( accepted: boolean ) =>
				toggleMonitor( accepted, activate )
			);
		},
		[ selectedSites, toggleMonitor, translate ]
	);

	return handleToggleActivateMonitor;
}

export function useHandleResetNotification(
	selectedSites: Array< Site >,
	isLargeScreen?: boolean
) {
	const translate = useTranslate();
	const { updateMonitorSettings } = useUpdateMonitorSettings( selectedSites );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( selectedSites, isLargeScreen );

	const resetMonitorDuration = useCallback(
		( accepted: boolean ) => {
			if ( accepted ) {
				const defaultDuration = durations.find( ( duration ) => duration.time === 5 );
				const params = {
					jetmon_defer_status_down_minutes: defaultDuration?.time,
				};
				updateMonitorSettings( params );
				recordEvent( 'reset_notification_save' );
			}
		},
		[ recordEvent, updateMonitorSettings ]
	);

	const handleResetNotification = useCallback( () => {
		const heading = translate( 'Reset Notification' );
		const components = {
			em: <em />,
			strong: <strong />,
		};

		const siteCountText = getSiteCountText( selectedSites );

		const content =
			selectedSites.length > 1
				? translate(
						'You are about to reset the monitor schedule to {{strong}}5 minutes{{/strong}} for %(siteCountText)s.',
						{
							args: { siteCountText },
							comment: "%(siteCountText) is no of sites, e.g. '2 sites'",
							components,
						}
				  )
				: translate(
						'You are about to reset the monitor schedule to {{strong}}5 minutes{{/strong}} for {{em}}%(siteUrl)s{{/em}}.',
						{
							args: { siteUrl: siteCountText },
							components,
						}
				  );

		return dialogContent( heading, content, resetMonitorDuration );
	}, [ resetMonitorDuration, selectedSites, translate ] );

	return handleResetNotification;
}

const MAX_ACTIONBAR_HEIGHT = 30;
const MIN_ACTIONBAR_WIDTH = 400;

export function useHandleShowHideActionBar( node: RefObject< HTMLDivElement > ) {
	const [ actionBarVisible, setActionBarVisible ] = useState( true );
	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const maybeMakeActionBarVisible = useCallback( () => {
		const actionBarDomElement = node ? node.current : null;

		if ( actionBarDomElement ) {
			if ( actionBarDomElement.offsetWidth < MIN_ACTIONBAR_WIDTH ) {
				return;
			}

			setTimeout( () => {
				const actionBarVisible = actionBarDomElement.offsetHeight <= MAX_ACTIONBAR_HEIGHT;
				setActionBarVisible( actionBarVisible );
			}, 1 );
		}
	}, [ node ] );

	useEffect( () => {
		window.addEventListener( 'resize', maybeMakeActionBarVisible );
		return () => {
			window.removeEventListener( 'resize', maybeMakeActionBarVisible );
		};
	}, [ maybeMakeActionBarVisible ] );

	useEffect( () => {
		if ( isBulkManagementActive ) {
			maybeMakeActionBarVisible();
		}
		// Do not add maybeMakeActionBarVisible to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isBulkManagementActive ] );

	return { actionBarVisible };
}
