import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, keyboard } from '@wordpress/icons';
import { Menu } from '@wordpress/ui';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import getViewSettingsSeen from '../../panel/state/selectors/get-view-settings-seen';
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
	const viewSettingsSeen = useSelector( getViewSettingsSeen );
	const savePreference = useSavePreference();

	// Nudge people towards settings they have never opened, once.
	const isNew = isViewSettingsEnabled && viewSettingsSeen === false;
	// Opening the menu clears the dot, so the label inside it reads from a snapshot taken
	// at that moment — otherwise it would vanish before anyone could read it.
	const [ showsWhatIsNew, setShowsWhatIsNew ] = useState( false );

	const markSeen = () =>
		savePreference( {
			preferences: { 'notifications-view-settings-seen': true },
			apply: () => actions.ui.setViewSettingsSeen( true ),
			revert: () => actions.ui.setViewSettingsSeen( false ),
		} );

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
			<Menu.Root
				onOpenChange={ ( isOpen: boolean ) => {
					if ( ! isOpen ) {
						return;
					}
					setShowsWhatIsNew( isNew );
					if ( isNew ) {
						markSeen();
					}
				} }
			>
				<Menu.Trigger
					render={
						<Button
							size="small"
							icon={ cog }
							label={ isNew ? __( 'Settings (new)' ) : __( 'Settings' ) }
							className={ clsx( 'wpnc-app__settings-toggle', { 'is-new': isNew } ) }
						/>
					}
				/>
				<Menu.Popup positioner={ <Menu.Positioner side="bottom" align="end" /> }>
					{ isViewSettingsEnabled && (
						<>
							<Menu.RadioGroup value={ layoutStyle } onValueChange={ setLayoutStyle }>
								<Menu.GroupLabel>
									{ __( 'Layout' ) }
									{ showsWhatIsNew && <span className="wpnc-app__new-badge">{ __( 'New' ) }</span> }
								</Menu.GroupLabel>
								{ LAYOUTS.map( ( { value, label } ) => (
									<Menu.RadioItem key={ value } value={ value }>
										<Menu.ItemLabel>{ label }</Menu.ItemLabel>
									</Menu.RadioItem>
								) ) }
							</Menu.RadioGroup>
							<Menu.Separator />
						</>
					) }
					<Menu.Group>
						<Menu.GroupLabel>{ __( 'Links' ) }</Menu.GroupLabel>
						<Menu.LinkItem href={ SETTINGS_URL } openInNewTab rel="noopener noreferrer">
							<Menu.ItemLabel>{ __( 'Notification settings' ) }</Menu.ItemLabel>
						</Menu.LinkItem>
					</Menu.Group>
				</Menu.Popup>
			</Menu.Root>
		</>
	);
}
