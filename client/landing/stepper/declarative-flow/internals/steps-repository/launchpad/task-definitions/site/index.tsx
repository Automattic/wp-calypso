import {
	isBlogOnboardingFlow,
	isDesignFirstFlow,
	isSiteAssemblerFlow,
	isStartWritingFlow,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { isDomainUpsellCompleted } from '../../task-helper';
import { EnhancedTask, Task, TaskAction, TaskActionTable, TaskContext } from '../../types';

const getCompletedTasks = ( tasks: Task[] ): Record< string, boolean > =>
	tasks.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur.id ]: cur.completed,
		} ),
		{}
	);

const getCompletedInfo = ( tasks: Task[], flow: string ): Record< string, boolean > => {
	const completedTasks = getCompletedTasks( tasks );
	return {
		firstPostPublished: completedTasks.first_post_published,
		planCompleted: completedTasks.plan_completed,
		setupBlogCompleted: completedTasks.setup_blog || ! isStartWritingFlow( flow ),
		setupSiteCompleted: completedTasks.setup_free,
	};
};

const getIsLaunchSiteTaskDisabled = ( flow: string, context: TaskContext ) => {
	const { tasks, site, checklistStatuses } = context;
	const { firstPostPublished, planCompleted, setupBlogCompleted, setupSiteCompleted } =
		getCompletedInfo( tasks, flow );

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses! );

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

const getOnboardingCartItems = ( context: TaskContext ) => {
	const { planCartItem, domainCartItem, productCartItems } = context;

	return [ planCartItem, domainCartItem, ...( productCartItems ?? [] ) ].filter(
		Boolean
	) as MinimalRequestCartProduct[];
};

const getLaunchSiteTaskTitle = ( task: Task, flow: string, context: TaskContext ) => {
	const { tasks } = context;
	const onboardingCartItems = getOnboardingCartItems( context );
	const isSupportedFlow = isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow );
	const { planCompleted } = getCompletedInfo( tasks, flow );
	if ( isSupportedFlow && planCompleted && onboardingCartItems.length ) {
		return translate( 'Checkout and launch' );
	}

	return task.title;
};

const getSiteLaunched: TaskAction = ( task, flow, context ): EnhancedTask => {
	const { completeLaunchSiteTask } = context;

	return {
		...task,
		isLaunchTask: true,
		title: getLaunchSiteTaskTitle( task, flow, context ),
		disabled: getIsLaunchSiteTaskDisabled( flow, context ),
		actionDispatch: () => completeLaunchSiteTask( task ),
		useCalypsoPath: false,
	};
};

export const actions: Partial< TaskActionTable > = {
	site_launched: getSiteLaunched,
};
