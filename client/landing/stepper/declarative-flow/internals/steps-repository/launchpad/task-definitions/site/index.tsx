import { isDesignFirstFlow, isSiteAssemblerFlow, isStartWritingFlow } from '@automattic/onboarding';
import { isDomainUpsellCompleted } from '../../task-helper';
import { EnhancedTask, TaskAction, TaskActionTable, TaskContext } from '../../types';

const getIsLaunchSiteTaskDisabled = ( flow: string, context: TaskContext ) => {
	const { tasks, site, checklistStatuses } = context;
	const completedTasks: Record< string, boolean > = tasks.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur.id ]: cur.completed,
		} ),
		{}
	);

	const firstPostPublished = completedTasks.first_post_published;
	const planCompleted = completedTasks.plan_completed;
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );
	const setupBlogCompleted = completedTasks.setup_blog || ! isStartWritingFlow( flow );
	const setupSiteCompleted = completedTasks.setup_free;

	if ( isStartWritingFlow( flow ) ) {
		return ! ( firstPostPublished && planCompleted && domainUpsellCompleted && setupBlogCompleted );
	}

	if ( isDesignFirstFlow( flow ) ) {
		return ! ( planCompleted && domainUpsellCompleted && setupBlogCompleted );
	}

	if ( isSiteAssemblerFlow( flow ) ) {
		return ! ( planCompleted && domainUpsellCompleted && setupSiteCompleted );
	}

	return false;
};

const getSiteLaunched: TaskAction = ( task, flow, context ): EnhancedTask => {
	const { getLaunchSiteTaskTitle, completeLaunchSiteTask } = context;

	return {
		...task,
		isLaunchTask: true,
		title: getLaunchSiteTaskTitle( task ),
		disabled: getIsLaunchSiteTaskDisabled( flow, context ),
		actionDispatch: () => completeLaunchSiteTask( task ),
		useCalypsoPath: false,
	};
};

export const actions: Partial< TaskActionTable > = {
	site_launched: getSiteLaunched,
};
