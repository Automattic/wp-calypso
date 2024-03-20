import { __experimentalText as Text, Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';

interface Props {
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
}
export const ScheduleListEmpty = ( props: Props ) => {
	const { onCreateNewSchedule, canCreateSchedules } = props;
	const { siteHasEligiblePlugins } = useSiteHasEligiblePlugins();
	const siteId = useSelector( getSelectedSiteId );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const managePluginsUrl = `${ siteAdminUrl }plugins.php`;
	const translate = useTranslate();

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
							onClick={ () => {
								window.location.href = managePluginsUrl;
							} }
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
