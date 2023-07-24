import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import SelectDropdown from 'calypso/components/select-dropdown';
import { availableNotificationDurations as durations } from '../../../sites-overview/utils';
import NotAvailableBadge from '../../not-available-badge';
import { RestrictionType } from '../../types';
import UpgradeBadge from '../../upgrade-badge';
import type { MonitorDuration } from '../../../sites-overview/types';

interface Props {
	selectedDuration?: MonitorDuration;
	selectDuration: ( duration: MonitorDuration ) => void;
	recordEvent: ( action: string, params?: object ) => void;
	restriction?: RestrictionType;
}

export default function NotificationDuration( {
	selectedDuration,
	selectDuration,
	recordEvent,
	restriction,
}: Props ) {
	const translate = useTranslate();

	const showPaidDuration = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	const selectableDuration = useMemo(
		() => ( showPaidDuration ? durations : durations.filter( ( duration ) => ! duration.isPaid ) ),
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
						disabled={ restriction !== 'none' && duration.isPaid }
					>
						{ duration.label }
						&nbsp;
						{ duration.isPaid && restriction === 'upgrade_required' && <UpgradeBadge /> }
						{ duration.isPaid && restriction === 'free_site_selected' && <NotAvailableBadge /> }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
		</div>
	);
}
