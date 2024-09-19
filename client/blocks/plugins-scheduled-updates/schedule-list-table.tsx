import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { Button, DropdownMenu, Tooltip, FormToggle } from '@wordpress/components';
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
export const ScheduleListTable = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const isWideScreen = useBreakpoint( WIDE_BREAKPOINT );

	const { onEditClick, onRemoveClick, onShowLogs } = props;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const { countInstalledPlugins, preparePluginsTooltipInfo } =
		usePreparePluginsTooltipInfo( siteSlug );
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat( siteSlug );
	const { activateSchedule } = useScheduledUpdatesActivateMutation();

	/**
	 * NOTE: If you update the table structure,
	 * make sure to update the ScheduleListCards component as well
	 */
	return (
		<table className="plugins-update-manager-table">
			<thead>
				<tr>
					<th>{ translate( 'Name' ) }</th>
					<th>{ translate( 'Last update' ) }</th>
					<th>{ translate( 'Next update' ) }</th>
					<th className="frequency">{ translate( 'Frequency' ) }</th>
					<th>{ translate( 'Plugins' ) }</th>
					<th>{ translate( 'Active' ) }</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ schedules.map( ( schedule ) => (
					<tr key={ schedule.id }>
						<td className="name">
							<Button
								className="schedule-name"
								variant="link"
								onClick={ () => onEditClick && onEditClick( schedule.id ) }
							>
								{ prepareScheduleName( schedule ) }
							</Button>
						</td>
						<td className="last-update">
							{ schedule.last_run_status && (
								<>
									<Badge type={ schedule.last_run_status } />
									{ ( schedule.last_run_timestamp ||
										schedule.last_run_status === 'in-progress' ) && (
										<Button
											className="schedule-last-run"
											variant="link"
											onClick={ () => onShowLogs( schedule.id ) }
										>
											{ schedule.last_run_status === 'in-progress'
												? translate( 'In progress' )
												: isWideScreen &&
												  schedule.last_run_timestamp &&
												  prepareDateTime( schedule.last_run_timestamp ) }
										</Button>
									) }
								</>
							) }

							{ ! schedule.last_run_status && ! schedule.last_run_timestamp && '-' }
						</td>
						<td className="next-update">{ prepareDateTime( schedule.timestamp ) }</td>
						<td className="frequency">
							{
								{
									daily: translate( 'Daily' ),
									weekly: translate( 'Weekly' ),
								}[ schedule.schedule ]
							}
						</td>
						<td>
							{ countInstalledPlugins( schedule.args ) }
							{ schedule?.args && (
								<Tooltip
									text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
									position="middle right"
									delay={ 0 }
									hideOnClick={ false }
								>
									<Icon className="icon-info" icon={ info } size={ 16 } />
								</Tooltip>
							) }
						</td>
						<td>
							<FormToggle
								checked={ schedule.active }
								onChange={ ( e ) =>
									activateSchedule( siteSlug, schedule.id, { active: e.target.checked } )
								}
							/>
						</td>
						<td style={ { textAlign: 'end' } }>
							<DropdownMenu
								popoverProps={ { position: 'bottom left' } }
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
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};
