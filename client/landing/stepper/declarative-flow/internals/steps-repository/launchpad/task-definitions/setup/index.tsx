import { type Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { getSiteIdOrSlug } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs(
			`/setup/${ flow }/freePostSetup`,
			getSiteIdOrSlug( flow, site, siteSlug )
		),
		useCalypsoPath: true,
	};
};

const getSetupBlog: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, getSiteIdOrSlug( flow, site, siteSlug ) ),
		disabled: task.completed && ! isBlogOnboardingFlow( flow ),
		useCalypsoPath: true,
	};
};

const getSetupNewsletterTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

const getSetupVideoPressTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( task.calypso_path, getSiteIdOrSlug( flow, site, siteSlug ) ),
		useCalypsoPath: true,
	};
};

const getSetupGeneralTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		disabled: false,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs( `/setup/update-options/options`, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
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
