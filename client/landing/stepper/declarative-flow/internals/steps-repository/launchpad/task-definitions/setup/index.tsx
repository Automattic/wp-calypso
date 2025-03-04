import { type Task } from '@automattic/launchpad';
import { isStartWritingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { getSiteIdOrSlug } from '../../task-helper';
import { type TaskAction } from '../../types';

export const getSetupFreeTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( `/setup/${ flow }/freePostSetup`, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
		} ),
		useCalypsoPath: true,
	};
};

export const getSetupBlogTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, { ...getSiteIdOrSlug( flow, site, siteSlug ) } ),
		disabled: task.completed && ! isStartWritingFlow( flow ),
		useCalypsoPath: true,
	};
};

export const getSetupNewsletterTask: TaskAction = ( task, flow, context ): Task => {
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

export const getSetupGeneralTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug } = context;

	return {
		...task,
		disabled: false,
		calypso_path: addQueryArgs( `/setup/update-options/options`, {
			...getSiteIdOrSlug( flow, site, siteSlug ),
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_free: getSetupFreeTask,
	setup_blog: getSetupBlogTask,
	setup_newsletter: getSetupNewsletterTask,
	setup_general: getSetupGeneralTask,
};
