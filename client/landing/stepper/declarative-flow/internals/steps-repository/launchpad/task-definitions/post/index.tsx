import { isBlogOnboardingFlow, isNewsletterFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { recordTaskClickTracksEvent } from '../../tracking';
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
		calypso_path: ! isBlogOnboardingFlow( flow || null )
			? `/post/${ siteInfoQueryArgs?.siteSlug }`
			: addQueryArgs( `https://${ siteInfoQueryArgs?.siteSlug }/wp-admin/post-new.php`, {
					origin: window.location.origin,
			  } ),
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		useCalypsoPath: true,
	};
};

export const actions: Partial< TaskActionTable > = {
	first_post_published: getFirstPostPublished,
};
