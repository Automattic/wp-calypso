import { type Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { getSiteInfoQueryArgs } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;
	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/${ flow }/freePostSetup`, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

const getSetupBlog: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;
	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		disabled: task.completed && ! isBlogOnboardingFlow( flow ),
		useCalypsoPath: true,
	};
};

const getSetupNewsletterTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

const getSetupVideoPressTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, siteInfoQueryArgs ),
		useCalypsoPath: true,
	};
};

const getSetupGeneralTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

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
	setup_blog: getSetupBlog,
	setup_newsletter: getSetupNewsletterTask,
	videopress_setup: getSetupVideoPressTask,
	setup_general: getSetupGeneralTask,
};
