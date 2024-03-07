import { Button, DropdownMenu, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { MOMENT_TIME_FORMAT } from './config';
import { usePreparePluginsTooltipInfo } from './hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from './hooks/use-prepare-schedule-name';
import { useSiteSlug } from './hooks/use-site-slug';
import { ellipsis } from './icons';

interface Props {
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
}
export const ScheduleListTable = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const moment = useLocalizedMoment();
	const { onEditClick, onRemoveClick } = props;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug );
	const { preparePluginsTooltipInfo } = usePreparePluginsTooltipInfo( siteSlug );
	const { prepareScheduleName } = usePrepareScheduleName();

	/**
	 * NOTE: If you update the table structure,
	 * make sure to update the ScheduleListCards component as well
	 */
	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Last Update</th>
					<th>Next Update</th>
					<th>Frequency</th>
					<th>Plugins</th>
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
						<td></td>
						<td>{ moment( schedule.timestamp * 1000 ).format( MOMENT_TIME_FORMAT ) }</td>
						<td>
							{
								{
									daily: 'Daily',
									weekly: 'Weekly',
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
										title: 'Edit',
										onClick: () => onEditClick( schedule.id ),
									},
									{
										title: 'Remove',
										onClick: () => onRemoveClick( schedule.id ),
									},
								] }
								icon={ ellipsis }
								label="More"
							/>
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};
