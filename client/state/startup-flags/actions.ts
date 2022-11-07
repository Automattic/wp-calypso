import { warningNotice } from 'calypso/state/notices/actions';
import { STARTUP_STATES_RANDOM_CLEAR_STATE_NOTIFIED } from '../action-types';

export function developerNotificationCompleted() {
	return {
		type: STARTUP_STATES_RANDOM_CLEAR_STATE_NOTIFIED,
	};
}

export function sympathyWarningNotice() {
	// Read more about this (sympathy) :  https://github.com/Automattic/wp-calypso/pull/14121, p4TIVU-6Ed-p2
	// TLDR: We try to clear state randomly to match closely to the UX of our user i.e. Sympathy.
	// In other words, you cannot rely on user's persisted state to be reliable so we randomly clear it to simulate that experience.
	return warningNotice( 'DEV NOTICE: Persisted redux state was randomly cleared', {
		id: 'Sympathy-Dev-Warning',
		duration: 8000,
		showDismiss: true,
		displayOnNextPage: true,
	} );
}
