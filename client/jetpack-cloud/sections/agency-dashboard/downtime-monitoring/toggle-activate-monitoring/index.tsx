import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useToggleActivateMonitor } from '../../hooks';
import type { AllowedStatusTypes, MonitorSettings } from '../../sites-overview/types';

import './style.scss';

interface Props {
	site: { blog_id: number; url: string };
	status: AllowedStatusTypes | string;
	settings: MonitorSettings | undefined;
}

export default function ToggleActivateMonitoring( { site, status, settings }: Props ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const [ toggleActivateMonitor, isLoading ] = useToggleActivateMonitor( site );

	const ToggleControl = OriginalToggleControl as React.ComponentType<
		OriginalToggleControl.Props & {
			disabled?: boolean;
		}
	>;

	function handleToggleActivateMonitoring( checked: boolean ) {
		toggleActivateMonitor( checked );
	}

	const isChecked = status !== 'disabled';

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
		return (
			<div className="toggle-activate-monitoring__duration">
				<img src={ clockIcon } alt="Monitoring duration" />
				<span>{ currentDurationText }</span>
			</div>
		);
	};

	return (
		<span className="toggle-activate-monitoring__toggle-button">
			<ToggleControl
				onChange={ handleToggleActivateMonitoring }
				checked={ isChecked }
				disabled={ isLoading }
				label={ isChecked && currentSettings() }
			/>
		</span>
	);
}
