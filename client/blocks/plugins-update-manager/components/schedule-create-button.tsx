import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}

export default function ScheduleCreateButton( { canCreateSchedules, onCreateNewSchedule }: Props ) {
	const disabled = ! canCreateSchedules;
	return (
		<Button
			__next40pxDefaultSize
			icon={ plus }
			variant={ disabled ? 'secondary' : 'primary' }
			onClick={ onCreateNewSchedule }
			disabled={ disabled }
		>
			Create a new schedule
		</Button>
	);
}
