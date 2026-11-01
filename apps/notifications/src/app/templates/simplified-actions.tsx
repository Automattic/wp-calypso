import { CardFooter, __experimentalHStack as HStack } from '@wordpress/components';
import { useSelector } from 'react-redux';
import { getActions, getReferenceId } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import ActionsMenu from './actions-menu';
import AnswerPromptButton from './button-answer-prompt';
import ApproveButton from './button-approve';
import LikeButton from './button-like';
import ReplyInput from './comment-reply-input';
import { getInitialReplyValue } from './get-initial-reply-value';
import type { Note } from '../types';

const MENU_ACTIONS = [ 'edit-comment', 'spam-comment', 'trash-comment' ];

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
	// Approve sits beside Like while the comment is pending; Unapprove is in the menu.
	const canApprove = hasAction( 'approve-comment' ) && ! isApproved;
	const hasMenu = hasAction( ...MENU_ACTIONS ) || ( hasAction( 'approve-comment' ) && isApproved );

	if ( ! hasLike && ! canApprove && ! hasAnswerPrompt && ! hasMenu ) {
		return null;
	}

	// A footer outside the scrolling body, like the reply below it, so the actions
	// stay pinned to the bottom of the panel.
	return (
		<CardFooter size="small" style={ { paddingBlock: '12px' } }>
			<HStack spacing={ 2 }>
				<HStack spacing={ 0.5 } justify="flex-start" expanded={ false }>
					{ hasLike && (
						<LikeButton
							note={ note }
							commentId={ getReferenceId( note, 'comment' ) }
							isLiked={ isLiked }
							isMinimal
						/>
					) }
					{ canApprove && (
						<ApproveButton
							className="wpnc__approve-action"
							note={ note }
							isApproved={ false }
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
		</CardFooter>
	);
}
