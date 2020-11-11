/**
 * External dependencies
 */
import { approveNote } from '../actions';

import { wpcom } from '../../../rest-client/wpcom';
import { bumpStat as rawBumpStat } from '../../../rest-client/bump-stat';

const { recordTracksEvent } = require( '../../../helpers/stats' );

function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}

const setApproveStatus = ( noteId, siteId, commentId, isApproved, type, client ) => (
	dispatch
) => {
	const comment = wpcom().site( siteId ).comment( commentId );

	dispatch( approveNote( noteId, isApproved ) );
	bumpStat( isApproved ? 'unapprove-comment' : 'approve-comment' );
	recordTracksEvent( 'calypso_notification_note_' + ( isApproved ? 'approve' : 'unapprove' ), {
		note_type: type,
	} );

	comment.update( { status: isApproved ? 'approved' : 'unapproved' }, () =>
		client.getNote( noteId )
	);
};

export default setApproveStatus;
