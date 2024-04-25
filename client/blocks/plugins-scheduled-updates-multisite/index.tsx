import { ScheduleCreate } from './schedule-create';
import { ScheduleList } from './schedule-list';

import './styles.scss';

type Props = {
	onNavBack?: () => void;
	context: 'create' | 'edit' | 'list';
};

export const PluginsScheduledUpdatesMultisite = ( { context, onNavBack }: Props ) => {
	switch ( context ) {
		case 'create':
			return <ScheduleCreate onNavBack={ onNavBack } />;
	}
	return <ScheduleList />;
};
