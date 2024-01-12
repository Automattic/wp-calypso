import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction, TaskActionTable } from '../../types';

const getSetupFree: TaskAction = ( task, flow, context ): Task => ( {
	...task,
	actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
	useCalypsoPath: true,
} );

const getSetupBlog: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		disabled: task.completed && ! isBlogOnboardingFlow( flow ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	setup_free: getSetupFree,
	setup_blog: getSetupBlog,
};
