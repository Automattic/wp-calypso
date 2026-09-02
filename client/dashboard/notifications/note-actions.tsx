import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Notice,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	check,
	comment,
	moreHorizontal,
	starEmpty,
	starFilled,
	pencil,
	trash,
} from '@wordpress/icons';
import { useNoteActions } from './use-note-actions';
import type { Note } from './engine';
import type { NoteActionItem, NoteActionsState } from './use-note-actions';

export function getActionIcon( item: NoteActionItem ) {
	switch ( item.key ) {
		case 'approve':
			return check;
		case 'like':
			return item.isPressed ? starFilled : starEmpty;
		case 'reply':
			return comment;
		case 'edit':
			return pencil;
		case 'trash':
			return trash;
		default:
			return undefined;
	}
}

export function UndoBar( { state }: { state: NoteActionsState } ) {
	if ( ! state.pendingUndoable ) {
		return null;
	}
	return (
		<HStack
			className="dashboard-notifications-inbox__undo-bar"
			justify="space-between"
			alignment="center"
		>
			<Text>
				{ state.pendingUndoable.kind === 'spam'
					? __( 'Comment marked as spam.' )
					: __( 'Comment moved to trash.' ) }
			</Text>
			<Button variant="link" onClick={ state.undo }>
				{ __( 'Undo' ) }
			</Button>
		</HStack>
	);
}

function ActionRow( { state }: { state: NoteActionsState } ) {
	return (
		<HStack
			justify="flex-start"
			spacing={ 1 }
			wrap
			className="dashboard-notifications-inbox__actions-row"
		>
			{ state.items.map( ( item ) => (
				<Button
					key={ item.key }
					variant="tertiary"
					size="small"
					icon={ getActionIcon( item ) }
					isPressed={ item.isPressed }
					href={ item.href }
					target={ item.href ? '_blank' : undefined }
					rel={ item.href ? 'noreferrer' : undefined }
					onClick={ item.onClick }
				>
					{ item.label }
				</Button>
			) ) }
			{ state.menuItems.length > 0 && (
				<DropdownMenu
					icon={ moreHorizontal }
					label={ __( 'More actions' ) }
					toggleProps={ { size: 'small' } }
				>
					{ ( { onClose } ) => (
						<MenuGroup>
							{ state.menuItems.map( ( item ) => (
								<MenuItem
									key={ item.key }
									icon={ getActionIcon( item ) }
									onClick={ () => {
										onClose();
										item.onClick?.();
									} }
								>
									{ item.label }
								</MenuItem>
							) ) }
						</MenuGroup>
					) }
				</DropdownMenu>
			) }
		</HStack>
	);
}

function ReplyBox( { state }: { state: NoteActionsState } ) {
	const submitOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' && ( event.metaKey || event.ctrlKey ) ) {
			event.preventDefault();
			state.reply.submit();
		}
	};
	return (
		<VStack spacing={ 2 } className="dashboard-notifications-inbox__reply-box">
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Reply' ) }
				hideLabelFromVision
				placeholder={ state.reply.placeholder }
				value={ state.reply.text }
				onChange={ state.reply.setText }
				onKeyDown={ submitOnEnter }
				rows={ 3 }
				disabled={ state.isSubmitting }
			/>
			<HStack justify="flex-end" spacing={ 2 }>
				<Button
					variant="primary"
					isBusy={ state.isSubmitting }
					disabled={ state.isSubmitting || ! state.reply.text.trim() }
					onClick={ state.reply.submit }
				>
					{ __( 'Send' ) }
				</Button>
				<Button variant="tertiary" disabled={ state.isSubmitting } onClick={ state.close }>
					{ __( 'Cancel' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

function EditBox( { state }: { state: NoteActionsState } ) {
	return (
		<VStack spacing={ 2 }>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Edit comment' ) }
				hideLabelFromVision
				value={ state.edit.text }
				onChange={ state.edit.setText }
				rows={ 4 }
				disabled={ state.isSubmitting }
			/>
			<HStack justify="flex-start" spacing={ 2 }>
				<Button
					variant="primary"
					isBusy={ state.isSubmitting }
					disabled={ state.isSubmitting || ! state.edit.text.trim() }
					onClick={ state.edit.submit }
				>
					{ __( 'Save' ) }
				</Button>
				<Button variant="tertiary" disabled={ state.isSubmitting } onClick={ state.close }>
					{ __( 'Cancel' ) }
				</Button>
				{ state.edit.editLink && (
					<Button variant="link" href={ state.edit.editLink } target="_blank" rel="noreferrer">
						{ __( 'Open in editor' ) }
					</Button>
				) }
			</HStack>
		</VStack>
	);
}

/** The per-note action row, rendered under the content it acts on. */
export default function NoteActions( { note }: { note: Note } ) {
	const state = useNoteActions( note );
	const hasButtons = state.items.length > 0 || state.menuItems.length > 0;

	if ( ! hasButtons && ! state.pendingUndoable ) {
		return null;
	}

	return (
		<VStack spacing={ 2 } className="dashboard-notifications-inbox__actions">
			<UndoBar state={ state } />
			{ hasButtons && <ActionRow state={ state } /> }
			{ state.error && (
				<Notice status="error" isDismissible onRemove={ state.clearError }>
					{ state.error }
				</Notice>
			) }
			{ state.mode === 'edit' && <EditBox state={ state } /> }
			{ state.mode === 'reply' && <ReplyBox state={ state } /> }
		</VStack>
	);
}
