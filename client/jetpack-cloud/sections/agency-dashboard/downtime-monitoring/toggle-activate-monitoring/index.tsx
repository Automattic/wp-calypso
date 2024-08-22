import { isEnabled } from '@automattic/calypso-config';
import { Button, Tooltip } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useState, useRef } from 'react';
import alertIcon from 'calypso/assets/images/jetpack/alert-icon.svg';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getSiteMonitorStatuses } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { useJetpackAgencyDashboardRecordTrackEvent, useToggleActivateMonitor } from '../../hooks';
import NotificationSettings from '../notification-settings';
import UpgradePopover from '../upgrade-popover';
import type { AllowedStatusTypes, MonitorSettings, Site } from '../../sites-overview/types';

import './style.scss';

interface Props {
	site: Site;
	status: AllowedStatusTypes | string;
	settings: MonitorSettings | undefined;
	tooltip: ReactNode;
	tooltipId: string;
	siteError: boolean;
	isLargeScreen?: boolean;
}

export default function ToggleActivateMonitoring( {
	site,
	status,
	settings,
	tooltip,
	tooltipId,
	siteError,
	isLargeScreen,
}: Props ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );
	const statuses = useSelector( getSiteMonitorStatuses );
	const [ showNotificationSettings, setShowNotificationSettings ] = useState< boolean >( false );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const isPaidTierEnabled = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	const shouldDisplayUpgradePopover =
		status === 'success' && isPaidTierEnabled && ! site.has_paid_agency_monitor && ! site.is_atomic;

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	function handleToggleActivateMonitoring( checked: boolean ) {
		recordEvent( checked ? 'enable_monitor_click' : 'disable_monitor_click' );
		toggleActivateMonitor( checked );
	}

	function handleToggleNotificationSettings() {
		if ( ! showNotificationSettings ) {
			recordEvent( 'notification_settings_open' );
		}
		setShowNotificationSettings( ( isOpen ) => ! isOpen );
	}

	const statusContentRef = useRef< HTMLButtonElement | null >( null );

	const isChecked = status !== 'disabled';
	const isLoading = statuses?.[ site.blog_id ] === 'loading';
	const smsLimitReached = settings?.is_over_limit;

	const currentSettings = () => {
		const minutes = settings?.check_interval;
		if ( ! minutes ) {
			return null;
		}
		// Convert minutes to moment duration to show "hr" if check_interval is greater than 60
		const duration = moment.duration( minutes, 'minutes' );
		const hours = Math.floor( duration.asHours() );
		const currentDurationText = hours
			? // Adding the plural form since some languages might need different forms for the abbreviation.
			  translate( '%(hours)dhr', '%(hours)dhr', {
					count: hours,
					args: {
						hours,
					},
					comment: '%(hours) is the no of hours, e.g. "1hr"',
			  } )
			: translate( '%(minutes)dm', '%(minutes)dm', {
					count: minutes,
					args: {
						minutes,
					},
					comment: '%(minutes) is the no of minutes, e.g. "5m"',
			  } );

		const currentSchedule = hours
			? translate( '%(hours)d hour', '%(hours)d hours', {
					count: hours,
					args: {
						hours,
					},
					comment: '%(hours) is the no of hours, e.g. "1 hour"',
			  } )
			: translate( '%(minutes)d minute', '%(minutes)d minutes', {
					count: minutes,
					args: {
						minutes,
					},
					comment: '%(minutes) is the no of minutes, e.g. "5 minutes"',
			  } );
		return (
			<div className="toggle-activate-monitoring__duration">
				<Button
					borderless
					compact
					onClick={ handleToggleNotificationSettings }
					disabled={ isLoading || site.sticker?.includes( 'migration-in-progress' ) }
					aria-label={
						translate(
							'The current notification schedule is set to %(currentSchedule)s. Click here to update the settings',
							{
								args: { currentSchedule },
								comment:
									'%(currentSchedule) is the current notification duration set, e.g. "1 hour" or "5 minutes"',
							}
						) as string
					}
				>
					{ isPaidTierEnabled && smsLimitReached ? (
						<img src={ alertIcon } alt={ translate( 'Alert' ) } />
					) : (
						<img src={ clockIcon } alt={ translate( 'Current Schedule' ) } />
					) }
					<span>{ currentDurationText }</span>
				</Button>
			</div>
		);
	};

	const toggleContent = (
		// For Atomic sites which do not support monitoring, we show the toggle as disabled.
		<ToggleControl
			onChange={ handleToggleActivateMonitoring }
			checked={ isChecked }
			disabled={ isLoading || siteError || site.sticker?.includes( 'migration-in-progress' ) }
			label={ isChecked && currentSettings() }
		/>
	);

	if ( siteError ) {
		return (
			<span className="toggle-activate-monitoring__toggle-button sites-overview__disabled">
				{ toggleContent }
			</span>
		);
	}

	const onHoverContent = () => {
		if ( shouldDisplayUpgradePopover && ! smsLimitReached ) {
			return (
				<UpgradePopover
					context={ statusContentRef.current }
					isVisible={ showTooltip }
					position="bottom left"
					onClose={ handleHideTooltip }
					dismissibleWithPreference
				/>
			);
		}

		let tooltipText = tooltip;
		if ( isPaidTierEnabled && smsLimitReached && status === 'success' ) {
			tooltipText = translate( 'You have reached the SMS limit' );
		}

		if ( tooltipText ) {
			return (
				<Tooltip
					id={ tooltipId }
					context={ statusContentRef.current }
					isVisible={ showTooltip }
					position="bottom"
					className="sites-overview__tooltip"
				>
					{ tooltipText }
				</Tooltip>
			);
		}
	};

	return (
		<>
			<button
				className="toggle-activate-monitoring__toggle-button"
				// We don't want to hide the tooltip when the user clicks on the
				// upgrade popover since it has buttons that user can interact with.
				onMouseDown={ shouldDisplayUpgradePopover ? undefined : handleHideTooltip }
				onMouseEnter={ handleShowTooltip }
				onMouseLeave={ handleHideTooltip }
				ref={ statusContentRef }
			>
				{ toggleContent }

				{ onHoverContent() }
			</button>

			{ showNotificationSettings && (
				<NotificationSettings
					onClose={ handleToggleNotificationSettings }
					sites={ [ site ] }
					settings={ settings }
					isLargeScreen={ isLargeScreen }
				/>
			) }
		</>
	);
}
