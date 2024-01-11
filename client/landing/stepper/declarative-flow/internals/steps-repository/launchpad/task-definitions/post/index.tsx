import { isBlogOnboardingFlow, isNewsletterFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../task-helper';
import { EnhancedTask, TaskAction, TaskActionTable } from '../../types';

const getFirstPostPublished: TaskAction = ( task, flow, context ): EnhancedTask => {
	const { siteInfoQueryArgs, isEmailVerified } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;
	return {
		...task,
		disabled:
			mustVerifyEmailBeforePosting ||
			( task.completed && isBlogOnboardingFlow( flow || null ) ) ||
			false,
		actionDispatch: () => recordTaskClickTracksEvent( flow, task.completed, task.id ),
		calypso_path: ! isBlogOnboardingFlow( flow || null )
			? `/post/${ siteInfoQueryArgs?.siteSlug }`
			: addQueryArgs( `https://${ siteInfoQueryArgs?.siteSlug }/wp-admin/post-new.php`, {
					origin: window.location.origin,
			  } ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	first_post_published: getFirstPostPublished,
};
