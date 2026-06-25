import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import { spamNote, trashNote } from '../../panel/state/notes/thunks';
import { Note } from '../types';
import HotkeyContainer from './container-hotkey';

// Destructive actions are kept out of the inline action row to reduce misclicks.
export default function ActionDropdown( { note, goBack }: { note: Note; goBack: () => void } ) {
	const dispatch = useDispatch();

	const [ isDeleting, setIsDeleting ] = useState( false );
	const [ isSpamming, setIsSpamming ] = useState( false );

	const actions = getActions( note );
	const hasDeleteAction = actions?.hasOwnProperty( 'trash-comment' );
	const hasSpamAction = actions?.hasOwnProperty( 'spam-comment' );
	const hasAnyAction = hasDeleteAction || hasSpamAction;

	const handleDelete = async () => {
		setIsDeleting( true );
		await ( dispatch as any )( trashNote( note, true ) );
		goBack();
	};

	const handleSpam = async () => {
		setIsSpamming( true );
		await ( dispatch as any )( spamNote( note, true ) );
		goBack();
	};

	const shortcuts = [
		...( hasDeleteAction ? [ { hotkey: 't', action: handleDelete } ] : [] ),
		...( hasSpamAction ? [ { hotkey: 's', action: handleSpam } ] : [] ),
	];

	return (
		// Always render the dropdown — disabled when the note has no actions — so
		// the header layout stays stable across notes instead of the toggle
		// appearing and disappearing.
		<HotkeyContainer shortcuts={ shortcuts }>
			<DropdownMenu
				icon={ moreVertical }
				label={ __( 'Actions' ) }
				toggleProps={ {
					size: 'small',
					disabled: ! hasAnyAction,
					accessibleWhenDisabled: true,
				} }
			>
				{ ( { onClose } ) => {
					return (
						<MenuGroup>
							{ hasSpamAction && (
								<MenuItem
									onClick={ async () => {
										await handleSpam();
										onClose();
									} }
								>
									{ isSpamming ? __( 'Marking as spam…' ) : __( 'Spam' ) }
								</MenuItem>
							) }
							{ hasDeleteAction && (
								<MenuItem
									onClick={ async () => {
										await handleDelete();
										onClose();
									} }
								>
									{ isDeleting ? __( 'Moving to the Trash…' ) : __( 'Trash' ) }
								</MenuItem>
							) }
						</MenuGroup>
					);
				} }
			</DropdownMenu>
		</HotkeyContainer>
	);
}
