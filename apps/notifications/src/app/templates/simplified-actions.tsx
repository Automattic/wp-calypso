import {
	CardDivider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useSelector } from 'react-redux';
import { getActions, getReferenceId } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import { getInitialReplyValue } from './actions';
import ActionsMenu from './actions-menu';
import AnswerPromptButton from './button-answer-prompt';
import LikeButton from './button-like';
import ReplyInput from './comment-reply-input';
import type { Note } from '../types';

const MENU_ACTIONS = [ 'approve-comment', 'edit-comment', 'spam-comment', 'trash-comment' ];

export const canReply = ( note: Note ): boolean => 'replyto-comment' in getActions( note );

export const NoteReply = ( { note }: { note: Note } ) => (
	<ReplyInput note={ note } defaultValue={ getInitialReplyValue( note ) } />
);

export default function SimplifiedActions( { note, goBack }: { note: Note; goBack: () => void } ) {
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const isLiked = useSelector( ( state ) => getIsNoteLiked( state, note ) );
	const actions = getActions( note );
	const hasAction = ( ...types: string[] ) => types.some( ( type ) => type in actions );

	const hasLike = hasAction( 'like-post', 'like-comment' );
	const hasAnswerPrompt = hasAction( 'answer-prompt' );
	const hasMenu = hasAction( ...MENU_ACTIONS );

	if ( ! hasLike && ! hasAnswerPrompt && ! hasMenu ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<CardDivider />
			<HStack spacing={ 2 }>
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					{ hasLike && (
						<LikeButton
							note={ note }
							commentId={ getReferenceId( note, 'comment' ) }
							isLiked={ isLiked }
							isMinimal
						/>
					) }
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
}
