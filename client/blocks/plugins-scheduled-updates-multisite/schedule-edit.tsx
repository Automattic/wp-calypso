import { Button, Spinner } from '@wordpress/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useLoadScheduleFromId } from './hooks/use-load-schedule-from-id';
import { ScheduleForm } from './schedule-form';
import type { MultiSiteSuccessParams } from 'calypso/blocks/plugins-scheduled-updates-multisite/types';
import type { ScheduleUpdates } from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	id: string;
	onNavBack?: () => void;
};

export const ScheduleEdit = ( { id, onNavBack }: Props ) => {
	const { schedule, scheduleLoaded, scheduleNotFound } = useLoadScheduleFromId( id );
	const { prepareScheduleName } = usePrepareScheduleName();
	const translate = useTranslate();

	// If the schedule is not found, navigate back to the list
	useEffect( () => {
		if ( scheduleNotFound ) {
			onNavBack?.();
		}
	}, [ scheduleNotFound, onNavBack ] );

	const onRecordSuccessEvent = ( params: MultiSiteSuccessParams ) => {
		recordTracksEvent( 'calypso_scheduled_updates_multisite_edit_schedule', params );
	};

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite plugins-update-manager-multisite-edit">
			<div className="plugins-update-manager-multisite__header no-border">
				<h1 className="wp-brand-font">
					{ schedule && scheduleLoaded
						? prepareScheduleName( schedule as unknown as ScheduleUpdates )
						: translate( 'Edit schedule' ) }
				</h1>
				<Button onClick={ onNavBack }>
					<Icon icon={ close } />
				</Button>
			</div>
			{ schedule && scheduleLoaded ? (
				<ScheduleForm
					key={ id }
					onNavBack={ onNavBack }
					scheduleForEdit={ schedule }
					onRecordSuccessEvent={ onRecordSuccessEvent }
				/>
			) : (
				<Spinner />
			) }
		</div>
	);
};
