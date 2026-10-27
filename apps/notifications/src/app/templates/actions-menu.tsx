import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown } from '@wordpress/icons';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getEditCommentLink, getReferenceId } from '../../panel/helpers/notes';
import { setApproveStatus, spamNote, trashNote } from '../../panel/state/notes/thunks';
import { editComment } from '../../panel/state/ui/actions';
import { useAppContext } from '../context';
import HotkeyContainer from './container-hotkey';
import type { Note } from '../types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

type MenuAction = {
	hotkey: string;
	label: string;
	isDestructive?: boolean;
	action: () => void;
};

type RemoveNote = typeof spamNote | typeof trashNote;

export default function ActionsMenu( {
	hasAction,
	isApproved,
	note,
	goBack,
}: {
	hasAction: ( ...types: string[] ) => boolean;
	isApproved: boolean;
	note: Note;
	goBack: () => void;
} ) {
	const dispatch = useDispatch< ThunkDispatch< unknown, unknown, UnknownAction > >();
	const { client } = useAppContext();
	const [ isBusy, setIsBusy ] = useState( false );
	const { site: siteId, post: postId, comment: commentId } = note.meta?.ids ?? {};

	const removeWith = ( remove: RemoveNote ) => async () => {
		if ( isBusy ) {
			return;
		}
		setIsBusy( true );
		try {
			await dispatch( remove( note, true ) );
		} catch {
			setIsBusy( false );
			return;
		}
		goBack();
	};

	const safeActions: ( MenuAction | false )[] = [
		hasAction( 'edit-comment' ) && {
			hotkey: 'e',
			label: __( 'Edit' ),
			action: () =>
				dispatch( editComment( siteId, postId, commentId, getEditCommentLink( note ) ) ),
		},
		hasAction( 'approve-comment' ) && {
			hotkey: 'a',
			label: isApproved ? __( 'Unapprove' ) : __( 'Approve' ),
			action: () =>
				dispatch(
					setApproveStatus(
						note.id,
						getReferenceId( note, 'site' ),
						getReferenceId( note, 'comment' ),
						! isApproved,
						note.type,
						client
					)
				),
		},
	];
	const removeActions: ( MenuAction | false )[] = [
		hasAction( 'spam-comment' ) && {
			hotkey: 's',
			label: __( 'Mark as spam' ),
			action: removeWith( spamNote ),
		},
		hasAction( 'trash-comment' ) && {
			hotkey: 't',
			label: __( 'Move to trash' ),
			isDestructive: true,
			action: removeWith( trashNote ),
		},
	];
	const groups = [ safeActions, removeActions ]
		.map( ( group ) => group.filter( ( item ): item is MenuAction => !! item ) )
		.filter( ( group ) => group.length > 0 );

	// The items only mount while the menu is open, so the shortcuts live out here.
	const shortcuts = groups.flat().map( ( { hotkey, action } ) => ( { hotkey, action } ) );

	return (
		<HotkeyContainer shortcuts={ shortcuts }>
			<DropdownMenu
				icon={ chevronDown }
				text={ __( 'Actions' ) }
				label={ __( 'Actions' ) }
				toggleProps={ {
					className: 'wpnc__actions-menu-toggle',
					variant: 'secondary',
					size: 'compact',
					iconPosition: 'right',
					showTooltip: false,
					isBusy,
					disabled: isBusy,
				} }
				popoverProps={ { placement: 'bottom-end', className: 'wpnc__actions-menu' } }
			>
				{ ( { onClose } ) =>
					groups.map( ( group ) => (
						<MenuGroup key={ group[ 0 ].hotkey }>
							{ group.map( ( { hotkey, label, isDestructive, action } ) => (
								<MenuItem
									key={ hotkey }
									isDestructive={ isDestructive }
									onClick={ ( event ) => {
										// Prevent the notification panel from being closed.
										event.stopPropagation();
										onClose();
										action();
									} }
								>
									{ label }
								</MenuItem>
							) ) }
						</MenuGroup>
					) )
				}
			</DropdownMenu>
		</HotkeyContainer>
	);
}
