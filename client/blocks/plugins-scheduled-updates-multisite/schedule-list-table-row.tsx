import { Button, DropdownMenu, Tooltip } from '@wordpress/components';
import { chevronDown, chevronRight, Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDateTimeFormat } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePrepareMultisitePluginsTooltipInfo } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { ellipsis } from 'calypso/blocks/plugins-scheduled-updates/icons';
import { ScheduleListLastRunStatus } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-last-run-status';
import { SiteSlug } from 'calypso/types';
import type {
	MultisiteSchedulesUpdates,
	MultisiteSiteDetails,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedule: MultisiteSchedulesUpdates;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
};

const ScheduleListTableRowMenu = ( {
	schedule,
	site,
	onEditClick,
	onRemoveClick,
	onLogsClick,
}: Props & { site?: MultisiteSiteDetails } ) => {
	const translate = useTranslate();

	const items = [
		{
			title: translate( 'Edit' ),
			onClick: () => onEditClick( schedule.id ),
		},
	];

	if ( site ) {
		items.push( {
			title: translate( 'Logs' ),
			onClick: () => onLogsClick( schedule.schedule_id, site.slug ),
		} );
	}

	items.push( {
		title: translate( 'Remove' ),
		onClick: () => onRemoveClick( schedule.schedule_id ),
	} );

	return (
		<DropdownMenu
			popoverProps={ { position: 'bottom left' } }
			controls={ items }
			icon={ ellipsis }
			label={ translate( 'More' ) }
		/>
	);
};

export const ScheduleListTableRow = ( props: Props ) => {
	const { schedule, onEditClick, onLogsClick } = props;

	const prepareSitesTooltipInfo = ( sites: MultisiteSchedulesUpdates[ 'sites' ] ) => {
		return sites.map( ( site ) => site.title ).join( '\n' );
	};

	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat();
	const { prepareMultiSitePluginsTooltipInfo } = usePrepareMultisitePluginsTooltipInfo(
		schedule.sites.map( ( site ) => site.ID )
	);
	const translate = useTranslate();
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<>
			<tr>
				<td>
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
				<td>
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
					<ScheduleListLastRunStatus schedule={ schedule } />
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
				<td className="plugins">
					{ schedule.args.length }{ ' ' }
					<Tooltip
						text={ prepareMultiSitePluginsTooltipInfo( schedule.args ) as unknown as string }
						position="middle right"
						delay={ 0 }
						hideOnClick={ false }
					>
						<Icon className="icon-info" icon={ info } size={ 16 } />
					</Tooltip>
				</td>
				<td style={ { textAlign: 'end' } }>
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
								site={ site }
								onLogsClick={ onLogsClick }
							/>
						</td>
						<td></td>
						<td></td>

						<td></td>
						<td style={ { textAlign: 'end' } }>
							<ScheduleListTableRowMenu { ...props } site={ site } />
						</td>
					</tr>
				) ) }
		</>
	);
};
