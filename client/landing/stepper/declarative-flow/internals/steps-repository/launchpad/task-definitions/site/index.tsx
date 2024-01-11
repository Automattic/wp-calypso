import { EnhancedTask, TaskAction, TaskActionTable } from '../../types';

const getSiteLaunched: TaskAction = ( task, _, context ): EnhancedTask => {
	const { getLaunchSiteTaskTitle, getIsLaunchSiteTaskDisabled, completeLaunchSiteTask } = context;

	return {
		...task,
		isLaunchTask: true,
		title: getLaunchSiteTaskTitle( task ),
		disabled: getIsLaunchSiteTaskDisabled(),
		actionDispatch: () => completeLaunchSiteTask( task ),
		useCalypsoPath: false,
	};
};

export const actions: Partial< TaskActionTable > = {
	site_launched: getSiteLaunched,
};
