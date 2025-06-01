import { updateLaunchpadSettings } from '@automattic/data-stores';
import { isNewsletterFlow } from '@automattic/onboarding';
import { type TaskAction } from '../../types';

const getSubscribersTask: TaskAction = ( task, flow, context ) => {
	const { goToStep, isEmailVerified } = context;

	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow || null ) && ! isEmailVerified;
	return {
		...task,
		disabled: mustVerifyEmailBeforePosting || false,
		actionDispatch: () => {
			if ( goToStep ) {
				goToStep( 'subscribers' );
			}
		},
	};
};

const addFirstSubscribersTask: TaskAction = ( task, flow, context ) => {
	const { siteSlug, goToStep, isEmailVerified } = context;

	const mustVerifyEmailBeforePosting = ! isEmailVerified;
	return {
		...task,
		disabled: mustVerifyEmailBeforePosting || false,
		actionDispatch: () => {
			if ( goToStep ) {
				// Mark this task completed on first use, as we don't want it to feel like a
				// requirement for this flow and more of a nudge / discoverability.
				updateLaunchpadSettings( siteSlug, {
					checklist_statuses: { add_first_subscribers: true },
				} );
				goToStep( 'subscribers' );
			}
		},
	};
};

export const actions = {
	subscribers_added: getSubscribersTask,
	add_first_subscribers: addFirstSubscribersTask,
};
