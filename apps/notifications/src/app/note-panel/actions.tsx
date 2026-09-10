import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, keyboard } from '@wordpress/icons';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import { useAppContext } from '../context';
import NoteShortcuts from '../note-shortcuts';
import { useSavePreference } from './use-save-preference';

const DENSITIES = [
	{ value: 'classic', label: __( 'Classic' ) },
	{ value: 'simplified', label: __( 'Simplified' ) },
];

export default function NotePanelActions() {
	const dispatch = useDispatch();
	const isShortcutsPopoverOpen = useSelector( getIsShortcutsPopoverOpen );
	const layoutStyle = useSelector( getLayoutStyle );
	const { isViewSettingsEnabled } = useAppContext();
	const savePreference = useSavePreference();

	const setLayoutStyle = ( value: string ) =>
		savePreference( {
			preferences: { 'notifications-layout-style': value },
			apply: () => actions.ui.setLayoutStyle( value ),
			revert: () => actions.ui.setLayoutStyle( layoutStyle ),
		} );

	return (
		<>
			<DropdownMenu
				icon={ keyboard }
				label={ __( 'Keyboard shortcuts' ) }
				// Drive the open state from Redux so the `i` keyboard shortcut
				// keeps toggling the panel.
				open={ isShortcutsPopoverOpen }
				onToggle={ ( willOpen ) => {
					if ( willOpen !== isShortcutsPopoverOpen ) {
						dispatch( actions.ui.toggleShortcutsPopover() );
					}
				} }
				toggleProps={ {
					size: 'small',
				} }
				popoverProps={ {
					focusOnMount: true,
				} }
			>
				{ () => <NoteShortcuts /> }
			</DropdownMenu>
			<DropdownMenu
				icon={ cog }
				label={ __( 'Settings' ) }
				toggleProps={ { size: 'small' } }
				popoverProps={ { placement: 'bottom-end' } }
			>
				{ ( { onClose } ) => (
					<>
						{ isViewSettingsEnabled && (
							<MenuGroup label={ __( 'Density' ) }>
								{ DENSITIES.map( ( { value, label } ) => (
									<MenuItem
										key={ value }
										role="menuitemradio"
										isSelected={ layoutStyle === value }
										onClick={ () => {
											setLayoutStyle( value );
											onClose();
										} }
									>
										{ label }
									</MenuItem>
								) ) }
							</MenuGroup>
						) }
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									dispatch( actions.ui.viewSettings() );
									onClose();
								} }
							>
								{ __( 'Notification settings' ) }
							</MenuItem>
						</MenuGroup>
					</>
				) }
			</DropdownMenu>
		</>
	);
}
