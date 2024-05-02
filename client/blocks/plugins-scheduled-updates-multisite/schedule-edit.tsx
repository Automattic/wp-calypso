import { Spinner } from '@wordpress/components';
import { useEffect } from 'react';
import { useLoadScheduleFromId } from './hooks/use-load-schedule-from-id';
import { ScheduleForm } from './schedule-form';

type Props = {
	id: string;
	onNavBack?: () => void;
};

export const ScheduleEdit = ( { id, onNavBack }: Props ) => {
	const { schedule, scheduleLoaded, scheduleNotFound } = useLoadScheduleFromId( id );

	// If the schedule is not found, navigate back to the list
	useEffect( () => {
		if ( scheduleNotFound ) {
			onNavBack?.();
		}
	}, [ scheduleNotFound, onNavBack ] );

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<h1 className="wp-brand-font">Edit schedule</h1>
			{ schedule && scheduleLoaded ? (
				<ScheduleForm onNavBack={ onNavBack } scheduleForEdit={ schedule } />
			) : (
				<Spinner />
			) }
		</div>
	);
};
