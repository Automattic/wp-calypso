import { ScheduleCreate } from './schedule-create';
import { ScheduleList } from './schedule-list';

import './styles.scss';

type Props = {
	onNavBack?: () => void;
	context: 'create' | 'edit' | 'list';
	onEditSchedule: ( id: string ) => void;
	onShowLogs: ( id: string, siteSlug: string ) => void;
	onCreateNewSchedule: () => void;
};

export const PluginsScheduledUpdatesMultisite = ( {
	context,
	onNavBack,
	onCreateNewSchedule,
	onEditSchedule,
	onShowLogs,
}: Props ) => {
	switch ( context ) {
		case 'create':
			return <ScheduleCreate onNavBack={ onNavBack } />;
	}
	return (
		<ScheduleList
			onCreateNewSchedule={ onCreateNewSchedule }
			onEditSchedule={ onEditSchedule }
			onShowLogs={ onShowLogs }
		/>
	);
};
