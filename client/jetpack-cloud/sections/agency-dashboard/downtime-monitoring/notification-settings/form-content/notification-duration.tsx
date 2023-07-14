import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import SelectDropdown from 'calypso/components/select-dropdown';
import { availableNotificationDurations as durations } from '../../../sites-overview/utils';
import type { MonitorDuration } from '../../../sites-overview/types';

interface Props {
	enablePaidDurations?: boolean;
	selectedDuration?: MonitorDuration;
	selectDuration: ( duration: MonitorDuration ) => void;
	recordEvent: ( action: string, params?: object ) => void;
}

export default function NotificationDuration( {
	enablePaidDurations,
	selectedDuration,
	selectDuration,
	recordEvent,
}: Props ) {
	const translate = useTranslate();

	const showPaidDuration = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	const selectableDuration = useMemo(
		() =>
			showPaidDuration ? durations : durations.filter( ( duration ) => ! duration.paid_tier ),
		[ showPaidDuration ]
	);

	return (
		<div className="notification-settings__content-block">
			<div className="notification-settings__content-heading">
				{ translate( 'Notify me about downtime:' ) }
			</div>
			<SelectDropdown
				onToggle={ ( { open: isOpen }: { open: boolean } ) => {
					if ( isOpen ) {
						recordEvent( 'notification_duration_toggle' );
					}
				} }
				selectedIcon={
					<img
						className="notification-settings__duration-icon"
						src={ clockIcon }
						alt={ translate( 'Schedules' ) }
					/>
				}
				selectedText={ selectedDuration?.label }
			>
				{ selectableDuration.map( ( duration ) => (
					<SelectDropdown.Item
						key={ duration.time }
						selected={ duration.time === selectedDuration?.time }
						onClick={ () => selectDuration( duration ) }
						disabled={ duration.paid_tier && ! enablePaidDurations }
					>
						{ duration.label }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
		</div>
	);
}
