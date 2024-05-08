import { Button, Spinner } from '@wordpress/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { useLoadScheduleFromId } from './hooks/use-load-schedule-from-id';
import { ScheduleForm } from './schedule-form';
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
				<ScheduleForm onNavBack={ onNavBack } scheduleForEdit={ schedule } />
			) : (
				<Spinner />
			) }
		</div>
	);
};
