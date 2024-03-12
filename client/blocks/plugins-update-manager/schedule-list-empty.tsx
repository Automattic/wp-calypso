import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const { onCreateNewSchedule, canCreateSchedules } = props;
	const translate = useTranslate();

	return (
		<div className="empty-state">
			<Text as="p" align="center">
				{ ! canCreateSchedules
					? translate( 'This site is unable to schedule auto-updates for plugins.' )
					: translate(
							'Take control of your site's maintenance by choosing when your plugins update—whatever day and time is most convenient. Up to two schedules let you enjoy hassle-free automatic updates, and our built-in rollback feature reverts any flawed updates for added peace of mind.'
					  ) }
			</Text>
			{ onCreateNewSchedule && (
				<Button
					__next40pxDefaultSize
					icon={ plus }
					variant={ canCreateSchedules ? 'primary' : 'secondary' }
					onClick={ onCreateNewSchedule }
					disabled={ ! canCreateSchedules }
				>
					{ translate( 'Add new schedule' ) }
				</Button>
			) }
		</div>
	);
};
