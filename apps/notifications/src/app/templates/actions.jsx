import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
	Icon,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { pending } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getActions, getCommentsUrl, getReferenceId } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import AnswerPromptButton from './button-answer-prompt';
import ApproveButton from './button-approve';
import EditButton from './button-edit';
import LikeButton from './button-like';
import SpamButton from './button-spam';
import ReplyInput from './comment-reply-input';

const getType = ( note ) => ( null === getReferenceId( note, 'comment' ) ? 'post' : 'comment' );

const pendingBadgeStyles = {
	container: {
		padding: '12px 16px',
		margin: '-16px -16px 0',
		backgroundColor: 'color-mix(in srgb, var(--color-warning, #f0b849) 10%, transparent)',
		borderInlineStart: '3px solid var(--color-warning, #f0b849)',
		fontSize: '13px',
	},
	icon: { fill: 'var(--color-warning, #f0b849)' },
	text: { fontWeight: 500, color: 'var(--color-warning-80, #614200)' },
	link: { marginInlineStart: 'auto', fontWeight: 500, whiteSpace: 'nowrap' },
};

const PendingApprovalBadge = ( { note } ) => {
	const commentsUrl = getCommentsUrl( getReferenceId( note, 'site' ) );

	return (
		<HStack
			className="wpnc__pending-approval-badge"
			spacing={ 2 }
			style={ pendingBadgeStyles.container }
		>
			<Icon icon={ pending } size={ 16 } style={ pendingBadgeStyles.icon } />
			<span style={ pendingBadgeStyles.text }>{ __( 'Pending Approval' ) }</span>
			{ commentsUrl && (
				<ExternalLink href={ commentsUrl } style={ pendingBadgeStyles.link }>
					{ __( 'Manage Comments' ) }
				</ExternalLink>
			) }
		</HStack>
	);
};

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

const ActionsPane = ( { isApproved, isLiked, note, goBack } ) => {
	const actions = getActions( note );
	const hasAction = ( types ) =>
		[].concat( types ).some( ( type ) => actions.hasOwnProperty( type ) );
	const showPendingBadge = hasAction( 'approve-comment' ) && ! isApproved;

	return (
		<VStack spacing={ 4 } style={ { width: '100%' } }>
			{ showPendingBadge && <PendingApprovalBadge note={ note } /> }
			<HStack spacing={ 2 }>
				{ hasAction( 'approve-comment' ) && (
					<ApproveButton note={ note } isApproved={ isApproved } />
				) }
				{ hasAction( 'spam-comment' ) && <SpamButton note={ note } goBack={ goBack } /> }
				{ hasAction( [ 'like-post', 'like-comment' ] ) && (
					<LikeButton note={ note } isLiked={ isLiked } />
				) }
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
	goBack: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isLiked: getIsNoteLiked( state, note ),
} );

export default connect( mapStateToProps )( ActionsPane );
