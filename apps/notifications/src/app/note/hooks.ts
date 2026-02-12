import { useNavigator } from '@wordpress/components';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { useAppContext } from '../context';
import type { Note } from '../types';

export function useNoteNavigationViaKeyboardShortcuts( {
	visibleNotes,
	note,
}: {
	visibleNotes: Note[];
	note?: Note;
} ) {
	const { params, goTo } = useNavigator();
	const { filterName } = params;

	const areKeyboardShortcutsEnabled = useSelector( getKeyboardShortcutsEnabled );

	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const { client } = useAppContext();

	useEffect( () => {
		if (
			! isLoading &&
			visibleNotes.length &&
			visibleNotes[ visibleNotes.length - 1 ].id === note?.id
		) {
			client?.loadMore();
		}
	}, [ isLoading, visibleNotes, note, client ] );

	const goToNoteById = ( noteId: number ) => {
		goTo( `/${ filterName }/notes/${ noteId }`, {
			replace: true,
		} );
	};

	const goToNoteByDirection = ( direction: number ) => {
		const isValidIndex = ( index: number ) => index >= 0 && index < visibleNotes.length;

		const noteIndex = visibleNotes.findIndex( ( currentNote ) => currentNote.id === note?.id );
		const newIndex = noteIndex + direction;

		if ( isValidIndex( newIndex ) ) {
			goToNoteById( visibleNotes[ newIndex ].id );
		}
	};

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! areKeyboardShortcutsEnabled ) {
				return;
			}
			if ( modifierKeyIsActive( event ) ) {
				return;
			}
			switch ( event.key ) {
				case 'j':
				case 'ArrowDown':
					stopEvent( event );
					goToNoteByDirection( 1 );
					break;
				case 'k':
				case 'ArrowUp':
					stopEvent( event );
					goToNoteByDirection( -1 );
					break;
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ areKeyboardShortcutsEnabled, note ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
