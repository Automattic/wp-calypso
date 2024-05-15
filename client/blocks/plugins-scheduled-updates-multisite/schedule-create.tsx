import { Button } from '@wordpress/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ScheduleForm } from './schedule-form';
import type { MultiSiteSuccessParams } from 'calypso/blocks/plugins-scheduled-updates-multisite/types';

type Props = {
	onNavBack?: () => void;
};

export const ScheduleCreate = ( { onNavBack }: Props ) => {
	const translate = useTranslate();

	const onRecordSuccessEvent = ( params: MultiSiteSuccessParams ) => {
		recordTracksEvent( 'calypso_scheduled_updates_multisite_create_schedule', params );
	};

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite plugins-update-manager-multisite-create">
			<div className="plugins-update-manager-multisite__header no-border">
				<h1 className="wp-brand-font">{ translate( 'New schedule' ) }</h1>
				<Button onClick={ onNavBack }>
					<Icon icon={ close } />
				</Button>
			</div>
			<ScheduleForm onNavBack={ onNavBack } onRecordSuccessEvent={ onRecordSuccessEvent } />
		</div>
	);
};
