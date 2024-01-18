import { Task } from '@automattic/launchpad';
import { isNewsletterFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getFirstPostPublishedNewsletter: TaskAction = ( task, flow, context ): Task => {
	const { isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow ) && ! isEmailVerified;

	return {
		...task,
		isLaunchTask: true,
		disabled: mustVerifyEmailBeforePosting || false,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		useCalypsoPath: true,
	};
};

const getSetupNewsletter: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		calypso_path: addQueryArgs( task.calypso_path, {
			...siteInfoQueryArgs,
			flowToReturnTo: flow,
		} ),
	};
};

export const actions = {
	first_post_published_newsletter: getFirstPostPublishedNewsletter,
	setup_newsletter: getSetupNewsletter,
};
