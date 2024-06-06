import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { Button, Tooltip, FormToggle } from '@wordpress/components';
import { chevronDown, chevronRight, Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDateTimeFormat } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePrepareMultisitePluginsTooltipInfo } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { usePrepareSitesTooltipInfo } from 'calypso/blocks/plugins-scheduled-updates-multisite/hooks/use-prepare-sites-tooltip-info';
import { ScheduleListLastRunStatus } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-last-run-status';
import { useScheduledUpdatesActivateBatchMutation } from 'calypso/data/plugins/use-scheduled-updates-activate-batch-mutation';
import { SiteSlug } from 'calypso/types';
import { ScheduleListTableRowMenu } from './schedule-list-table-row-menu';
import type {
	MultisiteSchedulesUpdates,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedule: MultisiteSchedulesUpdates;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
};

export const ScheduleListTableRow = ( props: Props ) => {
	const { schedule, onEditClick, onLogsClick } = props;
	const isWideScreen = useBreakpoint( WIDE_BREAKPOINT );

	const { prepareSitesTooltipInfo } = usePrepareSitesTooltipInfo();
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat();
	const { preparePluginsTooltipInfo, countInstalledPlugins } =
		usePrepareMultisitePluginsTooltipInfo( schedule.sites.map( ( site ) => site.ID ) );
	const translate = useTranslate();
	const [ isExpanded, setIsExpanded ] = useState( false );
	const { activateSchedule } = useScheduledUpdatesActivateBatchMutation();
	const batchActiveState = schedule.sites.some( ( site ) => site.active );

	return (
		<>
			<tr>
				<td className="expand">
					<Button variant="link" onClick={ () => setIsExpanded( ! isExpanded ) }>
						<Icon icon={ isExpanded ? chevronDown : chevronRight } />
					</Button>
				</td>
				<td className="name">
					<Button
						className="schedule-name"
						variant="link"
						onClick={ () => onEditClick && onEditClick( schedule.id ) }
					>
						{ prepareScheduleName( schedule as unknown as ScheduleUpdates ) }
					</Button>
				</td>
				<td className="sites">
					{ schedule.sites.length }{ ' ' }
					<Tooltip
						text={ prepareSitesTooltipInfo( schedule.sites ) as unknown as string }
						position="middle right"
						delay={ 0 }
						hideOnClick={ false }
					>
						<Icon className="icon-info" icon={ info } size={ 16 } />
					</Tooltip>
				</td>
				<td className="last-update">
					<ScheduleListLastRunStatus schedule={ schedule } showStatusText={ isWideScreen } />
				</td>
				<td className="next-update">
					{ prepareDateTime( schedule.timestamp, ! isWideScreen ? 'M d,' : undefined ) }
				</td>

				<td className="frequency">
					{
						{
							daily: translate( 'Daily' ),
							weekly: translate( 'Weekly' ),
						}[ schedule.schedule ]
					}
				</td>
				<td className="plugins">
					{ countInstalledPlugins( schedule.args ) }{ ' ' }
					<Tooltip
						text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
						position="middle right"
						delay={ 0 }
						hideOnClick={ false }
					>
						<Icon className="icon-info" icon={ info } size={ 16 } />
					</Tooltip>
				</td>
				<td className="active">
					<FormToggle
						checked={ batchActiveState }
						onChange={ ( e ) => {
							activateSchedule(
								schedule.sites.map( ( site ) => ( { id: site.ID, slug: site.slug } ) ),
								schedule.schedule_id,
								{ active: e.target.checked }
							);
						} }
					/>
				</td>
				<td className="menu">
					<ScheduleListTableRowMenu { ...props } />
				</td>
			</tr>
			{ isExpanded &&
				schedule.sites.map( ( site ) => (
					<tr
						key={ `${ schedule.id }_${ site.ID }` }
						className="plugins-update-manager-multisite-table__expanded"
					>
						<td></td>
						<td>{ site.title }</td>
						<td></td>
						<td>
							<ScheduleListLastRunStatus
								schedule={ schedule }
								showStatusText={ isWideScreen }
								site={ site }
								onLogsClick={ onLogsClick }
							/>
						</td>
						<td></td>
						<td className="frequency"></td>

						<td></td>
						<td className="active">
							<FormToggle
								checked={ site.active }
								onChange={ ( e ) =>
									activateSchedule( [ { id: site.ID, slug: site.slug } ], schedule.schedule_id, {
										active: e.target.checked,
									} )
								}
							/>
						</td>
						<td className="menu">
							<ScheduleListTableRowMenu { ...props } site={ site } />
						</td>
					</tr>
				) ) }
		</>
	);
};
