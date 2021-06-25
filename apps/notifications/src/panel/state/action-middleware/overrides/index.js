// freeze the local changes to mitigate races with note updates
// from the server which occurred before the action

/**
 * Internal dependencies
 */
import * as types from '../../action-types';
import actions from '../../actions';

/** @type {number} number of ms to hold on to local like overrides */
const LOCAL_ACTION_PERSISTENCE = 10000;

const timers = {
	localApprovals: {},
	localLikes: {},
};

const updateApprovals = ( { dispatch }, { noteId } ) => {
	const approvalTimers = timers.localApprovals;

	// local override should be a sliding window
	// so update time if it's still counting down
	if ( approvalTimers.hasOwnProperty( noteId ) ) {
		clearTimeout( approvalTimers[ noteId ] );
	}

	approvalTimers[ noteId ] = setTimeout(
		() => dispatch( actions.notes.resetLocalApproval( noteId ) ),
		LOCAL_ACTION_PERSISTENCE
	);
};

const updateLikes = ( { dispatch }, { noteId } ) => {
	const likeTimers = timers.localLikes;

	// local override should be a sliding window
	// so update time if it's still counting down
	if ( likeTimers.hasOwnProperty( noteId ) ) {
		clearTimeout( likeTimers[ noteId ] );
	}

	likeTimers[ noteId ] = setTimeout(
		() => dispatch( actions.notes.resetLocalLike( noteId ) ),
		LOCAL_ACTION_PERSISTENCE
	);
};

export default {
	[ types.APPROVE_NOTE ]: [ updateApprovals, updateLikes ],
	[ types.LIKE_NOTE ]: [ updateLikes ],
	[ types.SPAM_NOTE ]: [ updateApprovals, updateLikes ],
	[ types.TRASH_NOTE ]: [ updateApprovals, updateLikes ],
};
