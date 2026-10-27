import { type Task } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import { type TaskAction } from '../../types';

export const getSetupBlogTask: TaskAction = ( task, flow, context ): Task => {
	const { siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, { siteSlug } ),
		disabled: task.completed,
		useCalypsoPath: true,
	};
};

export const getSetupNewsletterTask: TaskAction = ( task, flow, context ): Task => {
	const { siteSlug } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			siteSlug,
			flowToReturnTo: flow,
		} ),
		useCalypsoPath: true,
	};
};

export const actions = {
	setup_blog: getSetupBlogTask,
	setup_newsletter: getSetupNewsletterTask,
};
