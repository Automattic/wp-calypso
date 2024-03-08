import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const { onCreateNewSchedule, canCreateSchedules } = props;

	return (
		<div className="empty-state">
			<Text as="p" align="center">
				{ ! canCreateSchedules
					? 'This site is unable to schedule auto-updates for plugins.'
					: 'Set up plugin update schedules to ensure your site runs smoothly.' }
			</Text>
			{ onCreateNewSchedule && (
				<Button
					__next40pxDefaultSize
					icon={ plus }
					variant={ canCreateSchedules ? 'primary' : 'secondary' }
					onClick={ onCreateNewSchedule }
					disabled={ ! canCreateSchedules }
				>
					Create a new schedule
				</Button>
			) }
		</div>
	);
};
