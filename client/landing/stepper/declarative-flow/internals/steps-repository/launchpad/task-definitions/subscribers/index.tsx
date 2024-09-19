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

export const actions = {
	subscribers_added: getSubscribersTask,
};
