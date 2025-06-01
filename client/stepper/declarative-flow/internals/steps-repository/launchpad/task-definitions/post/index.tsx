import { Task } from '@automattic/launchpad';
import { isNewsletterFlow, isStartWritingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { TaskAction } from '../../types';

export const getFirstPostPublished: TaskAction = ( task, flow, context ): Task => {
	const { isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;

	return {
		...task,
		disabled:
			mustVerifyEmailBeforePosting ||
			( task.completed && isStartWritingFlow( flow || null ) ) ||
			false,
		calypso_path: ! isStartWritingFlow( flow || null )
			? task.calypso_path
			: addQueryArgs( task.calypso_path, {
					origin: window.location.origin,
			  } ),
		useCalypsoPath: true,
	};
};

const getFirstPostPublishedNewsletterTask: TaskAction = ( task, flow, context ): Task => {
	const { isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow ) && ! isEmailVerified;

	return {
		...task,
		isLaunchTask: true,
		disabled: mustVerifyEmailBeforePosting || false,
		useCalypsoPath: true,
	};
};

export const actions = {
	first_post_published_newsletter: getFirstPostPublishedNewsletterTask,
	first_post_published: getFirstPostPublished,
};
