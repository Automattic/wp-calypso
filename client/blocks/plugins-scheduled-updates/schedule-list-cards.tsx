import { Button, DropdownMenu, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { Badge } from '../plugin-scheduled-updates-common/badge';
import { useDateTimeFormat } from '../plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePreparePluginsTooltipInfo } from '../plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from '../plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ellipsis } from './icons';

interface Props {
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onShowLogs: ( id: string ) => void;
}
export const ScheduleListCards = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const translate = useTranslate();
	const { onEditClick, onRemoveClick, onShowLogs } = props;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const { countInstalledPlugins, preparePluginsTooltipInfo } =
		usePreparePluginsTooltipInfo( siteSlug );
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat( siteSlug );

	return (
		<div className="schedule-list--cards">
			{ schedules.map( ( schedule ) => (
				<div className="schedule-list--card" key={ schedule.id }>
					<DropdownMenu
						className="schedule-list--card-actions"
						controls={ [
							{
								title: translate( 'Edit' ),
								onClick: () => onEditClick( schedule.id ),
							},
							{
								title: translate( 'Logs' ),
								onClick: () => onShowLogs( schedule.id ),
							},
							{
								title: translate( 'Remove' ),
								onClick: () => onRemoveClick( schedule.id ),
							},
						] }
						icon={ ellipsis }
						label={ translate( 'More' ) }
					/>

					<div className="schedule-list--card-label">
						<label htmlFor="name">{ translate( 'Name' ) }</label>
						<strong id="name">
							<Button
								className="schedule-name"
								variant="link"
								onClick={ () => onEditClick && onEditClick( schedule.id ) }
							>
								{ prepareScheduleName( schedule ) }
							</Button>
						</strong>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="last-update">{ translate( 'Last update' ) }</label>
						<span id="last-update">
							{ schedule.last_run_timestamp && (
								<Button
									className="schedule-last-run"
									variant="link"
									onClick={ () => onShowLogs( schedule.id ) }
								>
									{ prepareDateTime( schedule.last_run_timestamp ) }
								</Button>
							) }
							{ schedule.last_run_status && <Badge type={ schedule.last_run_status } /> }
						</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="next-update">{ translate( 'Next update' ) }</label>
						<span id="next-update">{ prepareDateTime( schedule.timestamp ) }</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="frequency">{ translate( 'Frequency' ) }</label>
						<span id="frequency">
							{
								{
									daily: translate( 'Daily' ),
									weekly: translate( 'Weekly' ),
								}[ schedule.schedule ]
							}
						</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="plugins">{ translate( 'Plugins' ) }</label>
						<span id="plugins">
							{ countInstalledPlugins( schedule.args ) }
							<Tooltip
								text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
								position="middle right"
								delay={ 0 }
								hideOnClick={ false }
							>
								<Icon className="icon-info" icon={ info } size={ 16 } />
							</Tooltip>
						</span>
					</div>
				</div>
			) ) }
		</div>
	);
};
