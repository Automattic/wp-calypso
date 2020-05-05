import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

import getIsNoteApproved from '../state/selectors/get-is-note-approved';
import getIsNoteLiked from '../state/selectors/get-is-note-liked';

import ApproveButton from './button-approve';
import EditButton from './button-edit';
import LikeButton from './button-like';
import ReplyInput from './comment-reply-input';
import SpamButton from './button-spam';
import TrashButton from './button-trash';

import { getActions, getReferenceId } from '../helpers/notes';

const getType = ( note ) => ( null === getReferenceId( note, 'comment' ) ? 'post' : 'comment') ;

const getInitialReplyValue = ( note, translate ) => {
	let ranges, username;

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
		return translate( 'Reply to %(username)s...', {
			args: { username },
		} );
	}

	return getType( note ) === 'post'
		? translate( 'Reply to post...' )
		: translate( 'Reply to comment...' );
};

const ActionsPane = ( { global, isApproved, isLiked, note, translate } ) => {
	const actions = getActions( note );
	const hasAction = ( types ) =>
		[].concat( types ).some( ( type ) => actions.hasOwnProperty( type ) );

	return (
		<div className="wpnc__note-actions">
			<div className="wpnc__note-actions__buttons">
				{ hasAction( 'approve-comment' ) && <ApproveButton { ...{ note, isApproved } } /> }
				{ hasAction( 'spam-comment' ) && <SpamButton note={ note } /> }
				{ hasAction( 'trash-comment' ) && <TrashButton note={ note } /> }
				{ hasAction( [ 'like-post', 'like-comment' ] ) && <LikeButton { ...{ note, isLiked } } /> }
				{ hasAction( 'edit-comment' ) && <EditButton note={ note } /> }
			</div>
			{ !! actions[ 'replyto-comment' ] && (
				<ReplyInput
					{ ...{
						note,
						defaultValue: getInitialReplyValue( note, translate ),
						global,
					} }
				/>
			) }
		</div>
	);
};

ActionsPane.propTypes = {
	global: PropTypes.object.isRequired,
	isApproved: PropTypes.bool.isRequired,
	isLiked: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isLiked: getIsNoteLiked( state, note ),
} );

export default connect( mapStateToProps )( localize( ActionsPane ) );
