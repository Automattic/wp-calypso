import {
	CardDivider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import { getInitialReplyValue } from './actions';
import ActionsMenu from './actions-menu';
import AnswerPromptButton from './button-answer-prompt';
import LikeButton from './button-like';
import ReplyInput from './comment-reply-input';

const SimplifiedActions = ( { isApproved, isLiked, note, goBack } ) => {
	const actions = getActions( note );
	const hasAction = ( types ) =>
		[].concat( types ).some( ( type ) => actions.hasOwnProperty( type ) );

	const hasLike = hasAction( [ 'like-post', 'like-comment' ] );
	const hasAnswerPrompt = hasAction( 'answer-prompt' );
	const hasMenu = hasAction( [
		'approve-comment',
		'edit-comment',
		'spam-comment',
		'trash-comment',
	] );

	if ( ! hasLike && ! hasAnswerPrompt && ! hasMenu ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<CardDivider />
			<HStack spacing={ 2 }>
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					{ hasLike && <LikeButton note={ note } isLiked={ isLiked } isQuiet /> }
					{ hasAnswerPrompt && <AnswerPromptButton note={ note } /> }
				</HStack>
				{ hasMenu && (
					<ActionsMenu
						hasAction={ hasAction }
						isApproved={ isApproved }
						note={ note }
						goBack={ goBack }
					/>
				) }
			</HStack>
		</VStack>
	);
};

SimplifiedActions.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	isLiked: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	goBack: PropTypes.func.isRequired,
};

export const canReply = ( note ) => !! getActions( note )[ 'replyto-comment' ];

export const NoteReply = ( { note } ) => (
	<ReplyInput note={ note } defaultValue={ getInitialReplyValue( note ) } />
);

NoteReply.propTypes = {
	note: PropTypes.object.isRequired,
};

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isLiked: getIsNoteLiked( state, note ),
} );

export default connect( mapStateToProps )( SimplifiedActions );
