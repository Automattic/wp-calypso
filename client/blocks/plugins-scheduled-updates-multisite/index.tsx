import { ScheduleCreate } from './schedule-create';

import './styles.scss';

type Props = {
	onNavBack?: () => void;
};

export const PluginsScheduledUpdatesMultisite = ( { onNavBack }: Props ) => {
	return <ScheduleCreate onNavBack={ onNavBack } />;
};
