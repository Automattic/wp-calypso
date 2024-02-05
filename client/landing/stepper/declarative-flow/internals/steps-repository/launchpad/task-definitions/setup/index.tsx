import { type Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

export const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

export const getSetupBlogTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		disabled: task.completed && ! isBlogOnboardingFlow( flow ),
		useCalypsoPath: true,
	};
};

export const getSetupNewsletterTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const getSetupVideoPressTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

export const getSetupGeneralTask: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		disabled: false,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/update-options/options`, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_free: getSetupFreeTask,
	setup_blog: getSetupBlogTask,
	setup_newsletter: getSetupNewsletterTask,
	videopress_setup: getSetupVideoPressTask,
	setup_general: getSetupGeneralTask,
};
