import { Button, DropdownMenu, FormToggle, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useScheduledUpdatesActivateMutation } from 'calypso/data/plugins/use-scheduled-updates-activate-mutation';
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
	const { activateSchedule } = useScheduledUpdatesActivateMutation();

	return (
		<div className="schedule-list--cards">
			{ schedules.map( ( schedule, i ) => (
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
						<label htmlFor={ `name-${ i }` }>{ translate( 'Name' ) }</label>
						<strong id={ `name-${ i }` }>
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
						<label htmlFor={ `last-update-${ i }` }>{ translate( 'Last update' ) }</label>
						<span id={ `last-update-${ i }` }>
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
						<label htmlFor={ `next-update-${ i }` }>{ translate( 'Next update' ) }</label>
						<span id={ `next-update-${ i }` }>{ prepareDateTime( schedule.timestamp ) }</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor={ `frequency-${ i }` }>{ translate( 'Frequency' ) }</label>
						<span id={ `frequency-${ i }` }>
							{
								{
									daily: translate( 'Daily' ),
									weekly: translate( 'Weekly' ),
								}[ schedule.schedule ]
							}
						</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor={ `plugins-${ i }` }>{ translate( 'Plugins' ) }</label>
						<span id={ `plugins-${ i }` }>
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

					<div className="schedule-list--card-label">
						<label htmlFor={ `active-${ i }` }>{ translate( 'Active' ) }</label>
						<span id={ `active-${ i }` }>
							<FormToggle
								checked={ schedule.active }
								onChange={ ( e ) =>
									activateSchedule( siteSlug, schedule.id, { active: e.target.checked } )
								}
							/>
						</span>
					</div>
				</div>
			) ) }
		</div>
	);
};
