/**
 * Internal dependencies
 */
import { approveNote } from '../actions';
import { wpcom } from '../../../rest-client/wpcom';
import { recordTracksEvent } from '../../../helpers/stats';
import bumpStat from '../utils/bump-stat';

const setApproveStatus = ( noteId, siteId, commentId, isApproved, type, restClient ) => (
	dispatch
) => {
	const comment = wpcom().site( siteId ).comment( commentId );

	dispatch( approveNote( noteId, isApproved ) );
	bumpStat( isApproved ? 'unapprove-comment' : 'approve-comment' );
	recordTracksEvent( 'calypso_notification_note_' + ( isApproved ? 'approve' : 'unapprove' ), {
		note_type: type,
	} );

	comment.update( { status: isApproved ? 'approved' : 'unapproved' }, () =>
		// getNote() updates the redux store with a fresh object from the API
		restClient.getNote( noteId )
	);
};

export default setApproveStatus;
