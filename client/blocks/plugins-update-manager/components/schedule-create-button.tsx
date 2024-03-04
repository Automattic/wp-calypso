import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}

export default function ScheduleCreateButton( { canCreateSchedules, onCreateNewSchedule }: Props ) {
	return (
		<Button
			__next40pxDefaultSize
			icon={ plus }
			variant="primary"
			onClick={ onCreateNewSchedule }
			disabled={ ! canCreateSchedules }
		>
			Create a new schedule
		</Button>
	);
}
