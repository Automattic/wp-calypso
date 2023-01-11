import { Button } from '@automattic/components';
import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSiteMonitorStatuses } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { useToggleActivateMonitor } from '../../hooks';
import NotificationSettings from '../notification-settings';
import type { AllowedStatusTypes, MonitorSettings } from '../../sites-overview/types';

import './style.scss';

interface Props {
	site: { blog_id: number; url: string };
	status: AllowedStatusTypes | string;
	settings: MonitorSettings | undefined;
	siteError: boolean;
}

export default function ToggleActivateMonitoring( { site, status, settings, siteError }: Props ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const statuses = useSelector( getSiteMonitorStatuses );
	const [ showNotificationSettings, setShowNotificationSettings ] = useState< boolean >( false );

	const ToggleControl = OriginalToggleControl as React.ComponentType<
		OriginalToggleControl.Props & {
			disabled?: boolean;
		}
	>;

	function handleToggleActivateMonitoring( checked: boolean ) {
		toggleActivateMonitor( checked );
	}

	function handleToggleNotificationSettings() {
		setShowNotificationSettings( ( isOpen ) => ! isOpen );
	}

	const isChecked = status !== 'disabled';
	const isLoading = statuses?.[ site.blog_id ] === 'loading';

	const currentSettings = () => {
		const minutes = settings?.monitor_deferment_time;
		if ( ! minutes ) {
			return null;
		}
		// Convert minutes to moment duration to show "hr" if monitor_deferment_time is greater than 60
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
					disabled={ isLoading }
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
					<img src={ clockIcon } alt={ translate( 'Current Schedule' ) } />
					<span>{ currentDurationText }</span>
				</Button>
			</div>
		);
	};

	return (
		<>
			<span
				className={ classNames( 'toggle-activate-monitoring__toggle-button', {
					[ 'sites-overview__disabled' ]: siteError,
				} ) }
			>
				<ToggleControl
					onChange={ handleToggleActivateMonitoring }
					checked={ isChecked }
					disabled={ isLoading || siteError }
					label={ isChecked && currentSettings() }
				/>
			</span>
			{ showNotificationSettings && (
				<NotificationSettings
					onClose={ handleToggleNotificationSettings }
					sites={ [ site ] }
					settings={ settings }
				/>
			) }
		</>
	);
}
