import { Button, DropdownMenu, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSiteDateTimeFormat } from 'calypso/blocks/plugins-update-manager/hooks/use-site-date-time-format';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { Badge } from './badge';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { usePreparePluginsTooltipInfo } from './hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from './hooks/use-prepare-schedule-name';
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

	const { onEditClick, onRemoveClick, onShowLogs } = props;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const { preparePluginsTooltipInfo } = usePreparePluginsTooltipInfo( siteSlug );
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useSiteDateTimeFormat( siteSlug );

	/**
	 * NOTE: If you update the table structure,
	 * make sure to update the ScheduleListCards component as well
	 */
	return (
		<table>
			<thead>
				<tr>
					<th>{ translate( 'Name' ) }</th>
					<th>{ translate( 'Last update' ) }</th>
					<th>{ translate( 'Next update' ) }</th>
					<th>{ translate( 'Frequency' ) }</th>
					<th>{ translate( 'Plugins' ) }</th>
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
						<td>
							{ schedule.last_run_status && (
								<Badge type={ schedule.last_run_status } />
							) }
							{ schedule.last_run_timestamp && (
								<Button
									className="schedule-last-run"
									variant="link"
									onClick={ () => onShowLogs( schedule.id ) }
								>
									{ prepareDateTime( schedule.last_run_timestamp ) }
								</Button>
							) }
							{ ! schedule.last_run_status && ! schedule.last_run_timestamp && '-' }
						</td>
						<td>{ prepareDateTime( schedule.timestamp ) }</td>
						<td>
							{
								{
									daily: translate( 'Daily' ),
									weekly: translate( 'Weekly' ),
								}[ schedule.schedule ]
							}
						</td>
						<td>
							{ schedule?.args?.length }
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
