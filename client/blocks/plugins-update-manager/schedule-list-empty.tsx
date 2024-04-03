import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';
import { useSiteSlug } from './hooks/use-site-slug';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();

	const { onCreateNewSchedule, canCreateSchedules } = props;
	const { siteHasEligiblePlugins } = useSiteHasEligiblePlugins();

	return (
		<div className="empty-state">
			<Text as="p" align="center">
				{ ( () => {
					if ( ! siteHasEligiblePlugins && canCreateSchedules ) {
						return translate(
							'To set up schedules to update your plugins, first you need to install plugins that are not managed by the plugin provider.'
						);
					} else if ( ! canCreateSchedules ) {
						return translate( 'This site is unable to schedule auto-updates for plugins.' );
					}
					return translate(
						"Take control of your site's maintenance by choosing when your plugins update—whatever day and time is most convenient. Up to two schedules let you enjoy hassle-free automatic updates, and our built-in rollback feature reverts any flawed updates for added peace of mind."
					);
				} )() }
			</Text>
			{ ( () => {
				if ( ! siteHasEligiblePlugins && canCreateSchedules ) {
					return (
						<Button
							__next40pxDefaultSize
							variant={ canCreateSchedules ? 'primary' : 'secondary' }
							href={ `/plugins/${ siteSlug }` }
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
