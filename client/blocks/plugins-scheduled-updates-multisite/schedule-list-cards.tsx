import clsx from 'classnames';
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
		</div>
	);
};
