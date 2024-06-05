import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'calypso/types';
import { ScheduleListCard } from './schedule-list-card';
import type { MultisiteSchedulesUpdates } from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	compact?: boolean;
	schedules: MultisiteSchedulesUpdates[];
	selectedScheduleId?: string;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
	search?: string;
};

export const ScheduleListCards = ( props: Props ) => {
	const translate = useTranslate();
	const { compact, schedules, selectedScheduleId, onEditClick, onLogsClick, onRemoveClick } = props;

	return (
		<div className="plugins-update-manager-multisite-cards">
			{ schedules.map( ( schedule ) => (
				<ScheduleListCard
					className={ clsx( { 'is-selected': selectedScheduleId === schedule.schedule_id } ) }
					compact={ compact }
					schedule={ schedule }
					onEditClick={ onEditClick }
					onRemoveClick={ onRemoveClick }
					onLogsClick={ onLogsClick }
					key={ schedule.id }
				/>
			) ) }
			{ schedules.length === 0 && (
				<div className="empty-state empty-state__center">
					<p>
						{ translate(
							"Oops! We couldn't find any schedules based on your search criteria. You might want to check your search terms and try again."
						) }
					</p>
				</div>
			) }
		</div>
	);
};
