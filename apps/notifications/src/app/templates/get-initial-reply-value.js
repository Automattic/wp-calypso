import { sprintf, __ } from '@wordpress/i18n';
import { getReferenceId } from '../../panel/helpers/notes';

const getType = ( note ) => ( null === getReferenceId( note, 'comment' ) ? 'post' : 'comment' );

export const getInitialReplyValue = ( note ) => {
	let ranges;
	let username;

	if ( 'user' === note.subject[ 0 ].ranges[ 0 ].type ) {
		// Build the username from the subject line
		ranges = note.subject[ 0 ].ranges[ 0 ].indices;
		username = note.subject[ 0 ].text.substring( ranges[ 0 ], ranges[ 1 ] );
	} else if ( 'user' === note.body[ 0 ].type ) {
		username = note.body[ 0 ].text;
	} else {
		username = null;
	}

	if ( username ) {
		return sprintf(
			/* translators: username is the name of user to reply */
			__( 'Reply to %(username)s…' ),
			{ username }
		);
	}

	return getType( note ) === 'post' ? __( 'Reply to post…' ) : __( 'Reply to comment…' );
};
