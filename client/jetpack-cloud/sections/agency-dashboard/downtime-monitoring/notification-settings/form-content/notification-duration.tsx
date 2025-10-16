import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import useNotificationDurations from '../../../sites-overview/hooks/use-notification-durations';
import FeatureRestrictionBadge from '../../feature-restriction-badge';
import UpgradeLink from '../../upgrade-link';
import type { MonitorDuration } from '../../../sites-overview/types';
import type { RestrictionType } from '../../types';

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

	const durations = useNotificationDurations();

	const isA4AEnvironment = isA8CForAgencies();

	return (
		<div className="notification-settings__content-block">
			<div className="notification-settings__content-heading">
				{ translate( 'Monitor my site every:' ) }
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
				{ durations.map( ( duration ) => (
					<SelectDropdown.Item
						key={ duration.time }
						selected={ duration.time === selectedDuration?.time }
						onClick={ () => selectDuration( duration ) }
						disabled={ restriction !== 'none' && duration.isPaid }
					>
						{ duration.label }
						{ duration.isPaid && (
							<>
								<FeatureRestrictionBadge restriction={ restriction } />
								{ restriction === 'upgrade_required' && ! isA4AEnvironment && (
									<UpgradeLink isInline />
								) }
							</>
						) }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
		</div>
	);
}
