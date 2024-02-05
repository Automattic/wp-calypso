import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isNewsletterFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

export const getFirstPostPublished: TaskAction = ( task, flow, context ): Task => {
	const { siteInfoQueryArgs, isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow ) && ! isEmailVerified;

	return {
		...task,
		disabled:
			mustVerifyEmailBeforePosting || ( task.completed && isBlogOnboardingFlow( flow ) ) || false,
		calypso_path: ! isBlogOnboardingFlow( flow )
			? `/post/${ siteInfoQueryArgs?.siteSlug }`
			: addQueryArgs( `https://${ siteInfoQueryArgs?.siteSlug }/wp-admin/post-new.php`, {
					origin: window.location.origin,
			  } ),
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
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
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		useCalypsoPath: true,
	};
};

export const actions = {
	first_post_published_newsletter: getFirstPostPublishedNewsletterTask,
	first_post_published: getFirstPostPublished,
};
