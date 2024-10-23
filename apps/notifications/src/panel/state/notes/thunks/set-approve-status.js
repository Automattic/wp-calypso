import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { approveNote } from '../actions';
import bumpStat from '../utils/bump-stat';

const setApproveStatus =
	( noteId, siteId, commentId, isApproved, type, restClient ) => ( dispatch ) => {
		const comment = wpcom().site( siteId ).comment( commentId );

		comment.update( { status: isApproved ? 'approved' : 'unapproved' }, () =>
			// getNote() updates the redux store with a fresh object from the API
			restClient.getNote( noteId )
		);

		dispatch( approveNote( noteId, isApproved ) );
		bumpStat( isApproved ? 'unapprove-comment' : 'approve-comment' );
		recordTracksEvent( 'calypso_notification_note_' + ( isApproved ? 'approve' : 'unapprove' ), {
			note_type: type,
		} );
	};

export default setApproveStatus;
