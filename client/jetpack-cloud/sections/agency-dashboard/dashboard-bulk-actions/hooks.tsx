import { useTranslate } from 'i18n-calypso';
import { ReactChild, useCallback } from 'react';
import acceptDialog from 'calypso/lib/accept';
import { useToggleActivateMonitor, useUpdateMonitorSettings } from '../hooks';
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

export function useHandleToggleMonitor( selectedSites: Array< { blog_id: number; url: string } > ) {
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( selectedSites );

	const toggleMonitor = useCallback(
		( accepted: boolean, activate: boolean ) => {
			if ( accepted ) {
				toggleActivateMonitor( activate );
			}
		},
		[ toggleActivateMonitor ]
	);

	const handleToggleActivateMonitor = useCallback(
		( activate: boolean ) => {
			const heading = activate ? translate( 'Resume Monitor' ) : translate( 'Pause Monitor' );
			const monitorAction = activate ? translate( 'resume' ) : translate( 'pause' );
			const siteCountText =
				selectedSites.length > 1
					? translate( '%(siteCount)d sites', {
							args: { siteCount: selectedSites.length },
							comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					  } )
					: selectedSites[ 0 ].url;
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

export function useHandleResetNotification( selectedSites: Array< Site > ) {
	const translate = useTranslate();
	const { updateMonitorSettings } = useUpdateMonitorSettings( selectedSites );

	const resetMonitorDuration = useCallback(
		( accepted: boolean ) => {
			if ( accepted ) {
				const defaultDuration = durations.find( ( duration ) => duration.time === 5 );
				const params = {
					jetmon_defer_status_down_minutes: defaultDuration?.time,
				};
				updateMonitorSettings( params );
			}
		},
		[ updateMonitorSettings ]
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

		return dailogContent( heading, content, resetMonitorDuration );
	}, [ resetMonitorDuration, selectedSites, translate ] );

	return handleResetNotification;
}
