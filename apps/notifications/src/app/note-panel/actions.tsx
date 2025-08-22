import { MenuGroup, MenuItem, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import NoteShortcuts from '../note-shortcuts';

export default function NotePanelActions() {
	const dispatch = useDispatch();

	const isShortcutsPopoverOpen = useSelector( getIsShortcutsPopoverOpen );

	return (
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'Actions' ) }
			onToggle={ ( willOpen ) => {
				if ( ! willOpen ) {
					dispatch( actions.ui.closeShortcutsPopover() );
				}
			} }
		>
			{ ( { onClose } ) =>
				isShortcutsPopoverOpen ? (
					<NoteShortcuts />
				) : (
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								dispatch( actions.ui.toggleShortcutsPopover() );
							} }
						>
							{ __( 'Keyboard shortcuts' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								onClose();
								dispatch( actions.ui.viewSettings() );
							} }
						>
							{ __( 'Settings' ) }
						</MenuItem>
					</MenuGroup>
				)
			}
		</DropdownMenu>
	);
}
