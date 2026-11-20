import { CardFooter, __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver, useViewportMatch } from '@wordpress/compose';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getActions, getReferenceId } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../../panel/state/selectors/get-is-note-liked';
import { useAppContext } from '../context';
import { getInitialReplyValue } from './actions';
import ActionsMenu from './actions-menu';
import AnswerPromptButton from './button-answer-prompt';
import ApproveButton from './button-approve';
import LikeButton from './button-like';
import SpamButton from './button-spam';
import ReplyInput from './comment-reply-input';
import type { Note } from '../types';

const MENU_ACTIONS = [ 'edit-comment', 'spam-comment', 'trash-comment' ];

// The footer's content width that fits Like, Unapprove, Spam and Actions side by side, with
// some room for longer labels. The two-pane page gives the note less than this up to about 1230px.
const EXPANDED_MIN_WIDTH = 400;

export const canReply = ( note: Note ): boolean => 'replyto-comment' in getActions( note );

export const NoteReply = ( { note }: { note: Note } ) => (
	<ReplyInput note={ note } defaultValue={ getInitialReplyValue( note ) } />
);

export default function SimplifiedActions( { note, goBack }: { note: Note; goBack: () => void } ) {
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const isLiked = useSelector( ( state ) => getIsNoteLiked( state, note ) );
	const { hasExpandedActions } = useAppContext();
	const isLargeScreen = useViewportMatch( 'large' );
	const [ footerWidth, setFooterWidth ] = useState< number >();
	const footerRef = useResizeObserver( ( [ entry ]: ResizeObserverEntry[] ) =>
		setFooterWidth( entry.contentRect.width )
	);
	const actions = getActions( note );
	const hasAction = ( ...types: string[] ) => types.some( ( type ) => type in actions );

	// With room for them, Unapprove and Spam join Like and Approve as buttons. Below the
	// two-pane width, or in a note too narrow for them, they go back into the menu.
	const isExpanded =
		hasExpandedActions &&
		isLargeScreen &&
		( footerWidth === undefined || footerWidth >= EXPANDED_MIN_WIDTH );

	const hasLike = hasAction( 'like-post', 'like-comment' );
	const hasAnswerPrompt = hasAction( 'answer-prompt' );
	// Approve sits beside Like while the comment is pending; Unapprove is in the menu unless
	// the actions are expanded.
	const canApprove = hasAction( 'approve-comment' ) && ! isApproved;
	const canUnapprove = isExpanded && hasAction( 'approve-comment' ) && isApproved;
	const canSpam = isExpanded && hasAction( 'spam-comment' );

	// The menu leaves out what's a button, along with its shortcut.
	const shownAsButton = [ canUnapprove && 'approve-comment', canSpam && 'spam-comment' ];
	const hasMenuAction = ( ...types: string[] ) =>
		hasAction( ...types.filter( ( type ) => ! shownAsButton.includes( type ) ) );
	const hasMenu =
		hasMenuAction( ...MENU_ACTIONS ) || ( hasMenuAction( 'approve-comment' ) && isApproved );

	if (
		! hasLike &&
		! canApprove &&
		! canUnapprove &&
		! canSpam &&
		! hasAnswerPrompt &&
		! hasMenu
	) {
		return null;
	}

	// A footer outside the scrolling body, like the reply below it, so the actions
	// stay pinned to the bottom of the panel.
	return (
		<CardFooter ref={ footerRef } size="small" style={ { paddingBlock: '12px' } }>
			{ /* Wrapping, so longer labels in a narrow note move down a line instead of overlapping. */ }
			<HStack spacing={ 2 } wrap>
				<HStack spacing={ 0.5 } justify="flex-start" expanded={ false } wrap>
					{ hasLike && (
						<LikeButton
							note={ note }
							commentId={ getReferenceId( note, 'comment' ) }
							isLiked={ isLiked }
							isMinimal
						/>
					) }
					{ /* One button for both, so it keeps the focus as it flips. */ }
					{ ( canApprove || canUnapprove ) && (
						<ApproveButton note={ note } isApproved={ isApproved } isMinimal />
					) }
					{ canSpam && <SpamButton note={ note } goBack={ goBack } isMinimal /> }
					{ hasAnswerPrompt && <AnswerPromptButton note={ note } /> }
				</HStack>
				{ hasMenu && (
					<ActionsMenu
						hasAction={ hasMenuAction }
						isApproved={ isApproved }
						note={ note }
						goBack={ goBack }
					/>
				) }
			</HStack>
		</CardFooter>
	);
}
