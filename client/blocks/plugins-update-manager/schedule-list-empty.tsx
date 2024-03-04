import { __experimentalText as Text } from '@wordpress/components';
import ScheduleCreateButton from './components/schedule-create-button';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
	isFetchingCanCreateSchedules: boolean;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const { onCreateNewSchedule, canCreateSchedules, isFetchingCanCreateSchedules } = props;

	return (
		<div className="empty-state">
			<Text as="p" align="center">
				{ ! isFetchingCanCreateSchedules && ! canCreateSchedules
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
