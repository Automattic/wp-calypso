import {
	Button,
	Dropdown,
	DropdownMenu,
	ExternalLink,
	RadioControl,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, keyboard } from '@wordpress/icons';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import { useAppContext } from '../context';
import NoteShortcuts from '../note-shortcuts';
import { useSavePreference } from './use-save-preference';

const SETTINGS_URL = 'https://wordpress.com/me/notifications';

const LAYOUTS = [
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
			<Dropdown
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						size="small"
						icon={ cog }
						onClick={ onToggle }
						aria-expanded={ isOpen }
						label={ __( 'Settings' ) }
					/>
				) }
				renderContent={ () => (
					<VStack spacing={ 3 } style={ { minWidth: '200px', padding: '8px' } }>
						{ isViewSettingsEnabled && (
							<VStack spacing={ 2 }>
								<Heading level={ 3 } size={ 13 } weight={ 500 }>
									{ __( 'Layout' ) }
								</Heading>
								<RadioControl
									label={ __( 'Layout' ) }
									hideLabelFromVision
									selected={ layoutStyle }
									options={ LAYOUTS }
									onChange={ setLayoutStyle }
								/>
							</VStack>
						) }
						<ExternalLink href={ SETTINGS_URL }>{ __( 'Notification settings' ) }</ExternalLink>
					</VStack>
				) }
			/>
		</>
	);
}
