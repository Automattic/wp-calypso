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
							'Keep your site up to date with scheduled automatic plugin updates. Built-in rollback included.'
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
					{ translate( 'Set up a new schedule' ) }
				</Button>
			) }
		</div>
	);
};
