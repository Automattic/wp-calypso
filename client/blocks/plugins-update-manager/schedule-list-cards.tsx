import { Button, DropdownMenu, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { MOMENT_TIME_FORMAT } from 'calypso/blocks/plugins-update-manager/config';
import { usePreparePluginsTooltipInfo } from 'calypso/blocks/plugins-update-manager/hooks/use-prepare-plugins-tooltip-info';
import { ellipsis } from 'calypso/blocks/plugins-update-manager/icons';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { useSiteSlug } from './hooks/use-site-slug';

interface Props {
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
}
export const ScheduleListCards = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const moment = useLocalizedMoment();
	const { onEditClick, onRemoveClick } = props;
	const { data: schedules = [] } = useScheduleUpdatesQuery( siteSlug );
	const { preparePluginsTooltipInfo } = usePreparePluginsTooltipInfo( siteSlug );

	return (
		<div className="schedule-list--cards">
			{ schedules.map( ( schedule ) => (
				<div className="schedule-list--card" key={ schedule.id }>
					<DropdownMenu
						className="schedule-list--card-actions"
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

					<div className="schedule-list--card-label">
						<label htmlFor="name">Name</label>
						<strong id="name">
							<Button
								className="schedule-name"
								variant="link"
								onClick={ () => onEditClick && onEditClick( schedule.id ) }
							>
								{ schedule.hook }
							</Button>
						</strong>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="last-update">Last Update</label>
						<span id="last-update"></span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="next-update">Next update</label>
						<span id="next-update">
							{ moment( schedule.timestamp * 1000 ).format( MOMENT_TIME_FORMAT ) }
						</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="frequency">Frequency</label>
						<span id="frequency">
							{
								{
									daily: 'Daily',
									weekly: 'Weekly',
								}[ schedule.schedule ]
							}
						</span>
					</div>

					<div className="schedule-list--card-label">
						<label htmlFor="plugins">Plugins</label>
						<span id="plugins">
							{ schedule?.args?.length }
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
