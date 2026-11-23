import { reportRequestError } from '../../../helpers/log-error';
import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { approveNote } from '../actions';
import bumpStat from '../utils/bump-stat';

const setApproveStatus =
	( noteId, siteId, commentId, isApproved, type, restClient ) => ( dispatch ) => {
		const comment = wpcom().site( siteId ).comment( commentId );

		// Settles once the server has answered, so a caller can wait before the next change.
		const update = new Promise( ( resolve ) =>
			comment.update( { status: isApproved ? 'approved' : 'unapproved' }, ( error ) => {
				if ( error ) {
					reportRequestError( 'approve', error );
				}
				// getNote() updates the redux store with a fresh object from the API
				restClient.getNote( noteId );
				resolve();
			} )
		);

		dispatch( approveNote( noteId, isApproved ) );
		bumpStat( isApproved ? 'unapprove-comment' : 'approve-comment' );
		recordTracksEvent( 'calypso_notification_note_' + ( isApproved ? 'approve' : 'unapprove' ), {
			note_type: type,
		} );

		return update;
	};

export default setApproveStatus;
