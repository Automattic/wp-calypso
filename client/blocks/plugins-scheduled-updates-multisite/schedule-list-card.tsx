import { Button, FormToggle, Tooltip } from '@wordpress/components';
import { chevronDown, chevronUp, Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDateTimeFormat } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-date-time-format';
import { usePrepareMultisitePluginsTooltipInfo } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-plugins-tooltip-info';
import { usePrepareScheduleName } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-prepare-schedule-name';
import { ScheduleListLastRunStatus } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-last-run-status';
import { ScheduleListTableRowMenu } from 'calypso/blocks/plugins-scheduled-updates-multisite/schedule-list-table-row-menu';
import { useScheduledUpdatesActivateBatchMutation } from 'calypso/data/plugins/use-scheduled-updates-activate-batch-mutation';
import { SiteSlug } from 'calypso/types';
import type {
	MultisiteSchedulesUpdates,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	className?: string;
	compact?: boolean;
	schedule: MultisiteSchedulesUpdates;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
};

export const ScheduleListCard = ( props: Props ) => {
	const translate = useTranslate();
	const { className, compact, schedule, onEditClick, onRemoveClick, onLogsClick } = props;
	const { prepareScheduleName } = usePrepareScheduleName();
	const { prepareDateTime } = useDateTimeFormat();
	const { preparePluginsTooltipInfo } = usePrepareMultisitePluginsTooltipInfo(
		schedule.sites.map( ( site ) => site.ID )
	);
	const { activateSchedule } = useScheduledUpdatesActivateBatchMutation();
	const [ isExpanded, setIsExpanded ] = useState( false );
	const batchActiveState = schedule.sites.some( ( site ) => site.active );

	return (
		<div className={ clsx( 'plugins-update-manager-multisite-card', className ) }>
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
				<>
					<div className="plugins-update-manager-multisite-card__label plugins-update-manager-multisite-card__last-update-label">
						<label htmlFor={ `last-update-${ schedule.id }` }>
							<Button variant="link" onClick={ () => setIsExpanded( ! isExpanded ) }>
								{ translate( 'Last update' ) }
								<Icon icon={ isExpanded ? chevronUp : chevronDown } />
							</Button>
						</label>
						<div>
							<ScheduleListLastRunStatus schedule={ schedule } />
						</div>
					</div>
					<div className="plugins-update-manager-multisite-card__label">
						<label htmlFor={ `active-${ schedule.id }` }>{ translate( 'Active' ) }</label>
						<span id={ `active-${ schedule.id }` }>
							<FormToggle
								checked={ batchActiveState }
								onChange={ ( e ) =>
									activateSchedule(
										schedule.sites.map( ( site ) => ( { id: site.ID, slug: site.slug } ) ),
										schedule.schedule_id,
										{ active: e.target.checked }
									)
								}
							/>
						</span>
					</div>
				</>
			) }

			{ isExpanded && (
				<div className="plugins-update-manager-multisite-card__sites">
					{ schedule.sites.map( ( site ) => (
						<div
							key={ `${ schedule.schedule_id }.${ site.ID }` }
							className="plugins-update-manager-multisite-card__sites-site"
						>
							<div className="plugins-update-manager-multisite-card__label">
								<label htmlFor={ `name-${ site.ID }` }>{ translate( 'Name' ) }</label>
								<strong id={ `name-${ site.ID }` }>{ site.title }</strong>
							</div>
							<div className="plugins-update-manager-multisite-card__label plugins-update-manager-multisite-card__last-update-label">
								<label htmlFor={ `last-update-${ site.ID }` }>{ translate( 'Last update' ) }</label>
								<div>
									<ScheduleListLastRunStatus schedule={ schedule } site={ site } />
								</div>
							</div>
							<div className="plugins-update-manager-multisite-card__label">
								<label htmlFor={ `active-${ site.ID }` }>{ translate( 'Active' ) }</label>
								<FormToggle
									checked={ site.active }
									onChange={ ( e ) =>
										activateSchedule( [ { id: site.ID, slug: site.slug } ], schedule.schedule_id, {
											active: e.target.checked,
										} )
									}
								/>
							</div>
						</div>
					) ) }
				</div>
			) }

			{ ! compact && (
				<div className="plugins-update-manager-multisite-card__label">
					<label htmlFor={ `next-update-${ schedule.id }` }>{ translate( 'Next update' ) }</label>
					<span id={ `next-update-${ schedule.id }` }>
						{ prepareDateTime( schedule.timestamp ) }
					</span>
				</div>
			) }
		</div>
	);
};
