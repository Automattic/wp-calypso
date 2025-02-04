import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

interface Props {
	onCreateNewSchedule: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const translate = useTranslate();

	const { onCreateNewSchedule } = props;

	return (
		<div className="plugins-update-manager-multisite-table-container">
			<div className="empty-state">
				<Text as="p">
					{ translate(
						"Take control of your site's maintenance by choosing when your plugins update—whatever day and time is most convenient. Enjoy hassle-free automatic updates, and our built-in rollback feature reverts any flawed updates for added peace of mind."
					) }
				</Text>
				<Button
					__next40pxDefaultSize
					icon={ plus }
					variant="primary"
					onClick={ onCreateNewSchedule }
				>
					{ translate( 'Add new schedule' ) }
				</Button>
			</div>
		</div>
	);
};
