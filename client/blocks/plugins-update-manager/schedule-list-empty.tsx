import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

interface Props {
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const { onCreateNewSchedule } = props;
	return (
		<div className="empty-state">
			<Text as="p" align="center">
				Set up plugin update schedules to ensure your site runs smoothly.
			</Text>
			{ onCreateNewSchedule && (
				<Button
					__next40pxDefaultSize
					icon={ plus }
					variant="primary"
					onClick={ onCreateNewSchedule }
				>
					Create a new schedule
				</Button>
			) }
		</div>
	);
};
