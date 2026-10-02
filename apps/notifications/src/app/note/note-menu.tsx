import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, moreVertical } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from '../../panel/helpers/stats';
import actions from '../../panel/state/actions';
import type { Note } from '../types';

type ManageDestination = { kind: 'reader_site'; url: string } | { kind: 'settings' };

export const getManageDestination = ( note: Note ): ManageDestination => {
	const siteId = note.meta?.ids?.site;

	if ( note.type === 'new_post' && siteId ) {
		return {
			kind: 'reader_site',
			url: `https://wordpress.com/reader/site/subscription/${ siteId }`,
		};
	}

	return { kind: 'settings' };
};

const NoteMenu = ( { note }: { note: Note } ) => {
	const dispatch = useDispatch();
	const destination = getManageDestination( note );

	const recordClick = () =>
		recordTracksEvent( 'calypso_notification_note_menu_click', {
			destination: destination.kind,
			note_type: note.type,
		} );

	return (
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'More actions' ) }
			toggleProps={ { size: 'small' } }
			popoverProps={ { inline: true } }
		>
			{ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						icon={ external }
						onClick={ () => {
							recordClick();
							if ( destination.kind === 'reader_site' ) {
								window.open( destination.url, '_blank', 'noopener' );
							} else {
								dispatch( actions.ui.viewSettings() );
							}
							onClose();
						} }
					>
						{ destination.kind === 'reader_site'
							? __( 'Manage subscription' )
							: __( 'Notification settings' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export default NoteMenu;
