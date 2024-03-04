import { __experimentalText as Text } from '@wordpress/components';
import ScheduleCreateButton from './components/schedule-create-button';

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
					? 'This site cannot auto-update plugins.'
					: 'Set up plugin update schedules to ensure your site runs smoothly.' }
			</Text>
			{ onCreateNewSchedule && (
				<ScheduleCreateButton
					onCreateNewSchedule={ onCreateNewSchedule }
					canCreateSchedules={ canCreateSchedules }
				/>
			) }
		</div>
	);
};
