import { type Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

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

const getSetupVideoPressTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_free: getSetupFreeTask,
	setup_blog: getSetupBlog,
	videopress_setup: getSetupVideoPressTask,
};
