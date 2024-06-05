import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';

interface Props {
	pluginsUrl: string;
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const translate = useTranslate();

	const { pluginsUrl, onCreateNewSchedule, canCreateSchedules } = props;
	const { siteHasEligiblePlugins } = useSiteHasEligiblePlugins();

	return (
		<div className="empty-state empty-state__center">
			<Text as="p">
				{ ( () => {
					if ( ! siteHasEligiblePlugins && canCreateSchedules ) {
						return translate(
							'To set up schedules to update your plugins, first you need to install plugins that are not managed by the plugin provider.'
						);
					} else if ( ! canCreateSchedules ) {
						return translate( 'This site is unable to schedule auto-updates for plugins.' );
					}
					return translate(
						"Take control of your site's maintenance by choosing when your plugins update—whatever day and time is most convenient. Enjoy hassle-free automatic updates with our built-in rollback feature, reverting any flawed updates for added peace of mind."
					);
				} )() }
			</Text>
			{ ( () => {
				if ( ! siteHasEligiblePlugins && canCreateSchedules ) {
					return (
						<Button
							__next40pxDefaultSize
							variant={ canCreateSchedules ? 'primary' : 'secondary' }
							href={ pluginsUrl }
						>
							{ translate( 'Explore plugins' ) }
						</Button>
					);
				}
				return (
					<Button
						__next40pxDefaultSize
						icon={ plus }
						variant={ canCreateSchedules ? 'primary' : 'secondary' }
						onClick={ onCreateNewSchedule }
						disabled={ ! canCreateSchedules }
					>
						{ translate( 'Add new schedule' ) }
					</Button>
				);
			} )() }
		</div>
	);
};
