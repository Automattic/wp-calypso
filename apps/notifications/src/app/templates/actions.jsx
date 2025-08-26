import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getActions, getReferenceId } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import AnswerPromptButton from './button-answer-prompt';
import ApproveButton from './button-approve';
import EditButton from './button-edit';
import LikeButton from './button-like';
import SpamButton from './button-spam';
import TrashButton from './button-trash';
import ReplyInput from './comment-reply-input';

const getType = ( note ) => ( null === getReferenceId( note, 'comment' ) ? 'post' : 'comment' );

const getInitialReplyValue = ( note ) => {
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

const ActionsPane = ( { isApproved, isLiked, note } ) => {
	const actions = getActions( note );
	const hasAction = ( types ) =>
		[].concat( types ).some( ( type ) => actions.hasOwnProperty( type ) );

	return (
		<VStack spacing={ 4 } style={ { width: '100%' } }>
			<HStack spacing={ 2 }>
				{ hasAction( 'approve-comment' ) && <ApproveButton { ...{ note, isApproved } } /> }
				{ hasAction( 'spam-comment' ) && <SpamButton note={ note } /> }
				{ hasAction( 'trash-comment' ) && <TrashButton note={ note } /> }
				{ hasAction( [ 'like-post', 'like-comment' ] ) && <LikeButton { ...{ note, isLiked } } /> }
				{ hasAction( 'edit-comment' ) && <EditButton note={ note } /> }
				{ hasAction( 'answer-prompt' ) && <AnswerPromptButton note={ note } /> }
			</HStack>
			{ !! actions[ 'replyto-comment' ] && (
				<ReplyInput note={ note } defaultValue={ getInitialReplyValue( note ) } />
			) }
		</VStack>
	);
};

ActionsPane.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	isLiked: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
};

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isLiked: getIsNoteLiked( state, note ),
} );

export default connect( mapStateToProps )( ActionsPane );
