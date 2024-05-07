import { Button, Tooltip } from '@wordpress/components';
import { chevronDown, chevronUp, Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDateTimeFormat } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePrepareMultisitePluginsTooltipInfo } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { ScheduleListLastRunStatus } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-last-run-status';
import { ScheduleListTableRowMenu } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-table-row-menu';
import { SiteSlug } from 'calypso/types';
import type {
	MultisiteSchedulesUpdates,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	compact?: boolean;
	schedule: MultisiteSchedulesUpdates;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
};

export const ScheduleListCard = ( props: Props ) => {
	const { compact, schedule, onEditClick, onRemoveClick, onLogsClick } = props;
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat();
	const { preparePluginsTooltipInfo } = usePrepareMultisitePluginsTooltipInfo(
		schedule.sites.map( ( site ) => site.ID )
	);
	const translate = useTranslate();
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<div className="plugins-update-manager-multisite-card">
			<div className="plugins-update-manager-multisite-card__label  plugins-update-manager-multisite-card__name-label">
				<strong id="name">
					<Button
						className="schedule-name"
						variant="link"
						onClick={ () => onEditClick && onEditClick( schedule.id ) }
					>
						{ prepareScheduleName( schedule as unknown as ScheduleUpdates ) }
					</Button>
					<span id="plugins">
						<Tooltip
							text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
							position="middle right"
							delay={ 0 }
							hideOnClick={ false }
						>
							<Icon className="icon-info" icon={ info } size={ 16 } />
						</Tooltip>
					</span>
				</strong>
				<ScheduleListTableRowMenu
					schedule={ schedule }
					onEditClick={ onEditClick }
					onRemoveClick={ onRemoveClick }
					onLogsClick={ onLogsClick }
				/>
			</div>

			{ ! compact && (
				<div className="plugins-update-manager-multisite-card__label plugins-update-manager-multisite-card__last-update-label">
					<label htmlFor="last-update">
						<Button variant="link" onClick={ () => setIsExpanded( ! isExpanded ) }>
							{ translate( 'Last update' ) }
							<Icon icon={ isExpanded ? chevronUp : chevronDown } />
						</Button>
					</label>
					<div>
						<ScheduleListLastRunStatus schedule={ schedule } />
					</div>
				</div>
			) }

			{ isExpanded && (
				<div className="plugins-update-manager-multisite-card__sites">
					{ schedule.sites.map( ( site ) => (
						<div
							key={ `${ schedule.schedule_id }.${ site.ID }` }
							className="plugins-update-manager-multisite-card__sites-site"
						>
							<div className="plugins-update-manager-multisite-card__label">
								<label htmlFor="name">{ translate( 'Name' ) }</label>
								<strong id="name">{ site.title }</strong>
							</div>
							<div className="plugins-update-manager-multisite-card__label plugins-update-manager-multisite-card__last-update-label">
								<label htmlFor="last-update">{ translate( 'Last update' ) }</label>
								<div>
									<ScheduleListLastRunStatus schedule={ schedule } site={ site } />
								</div>
							</div>
						</div>
					) ) }
				</div>
			) }

			{ ! compact && (
				<div className="plugins-update-manager-multisite-card__label">
					<label htmlFor="next-update">{ translate( 'Next update' ) }</label>
					<span id="next-update">{ prepareDateTime( schedule.timestamp ) }</span>
				</div>
			) }
		</div>
	);
};
