import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isNewsletterFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { getSiteInfoQueryArgs } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getFirstPostPublished: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug, isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;
	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		disabled:
			mustVerifyEmailBeforePosting ||
			( task.completed && isBlogOnboardingFlow( flow || null ) ) ||
			false,
		calypso_path: ! isBlogOnboardingFlow( flow || null )
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
