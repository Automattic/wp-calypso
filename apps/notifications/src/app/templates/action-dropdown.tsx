import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import { trashNote } from '../../panel/state/notes/thunks';
import { Note } from '../types';
import HotkeyContainer from './container-hotkey';

export default function ActionDropdown( { note, goBack }: { note: Note; goBack: () => void } ) {
	const dispatch = useDispatch();

	const [ isDeleting, setIsDeleting ] = useState( false );

	const actions = getActions( note );
	const hasDeleteAction = actions?.hasOwnProperty( 'trash-comment' );

	if ( ! hasDeleteAction ) {
		return null;
	}

	const handleDelete = async () => {
		setIsDeleting( true );
		await ( dispatch as any )( trashNote( note, true ) );
		goBack();
	};

	return (
		<HotkeyContainer shortcuts={ [ { hotkey: 't', action: handleDelete } ] }>
			<DropdownMenu
				icon={ moreVertical }
				label={ __( 'Actions' ) }
				toggleProps={ { size: 'small' } }
			>
				{ ( { onClose } ) => {
					return (
						<MenuGroup>
							<MenuItem
								onClick={ async () => {
									await handleDelete();
									onClose();
								} }
							>
								{ isDeleting ? __( 'Moving to the Trash…' ) : __( 'Trash' ) }
							</MenuItem>
						</MenuGroup>
					);
				} }
			</DropdownMenu>
		</HotkeyContainer>
	);
}
