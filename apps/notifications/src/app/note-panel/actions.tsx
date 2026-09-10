import { Button, DropdownMenu, ExternalLink, Icon, privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { bell, cog, keyboard } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import { useAppContext } from '../context';
import NoteShortcuts from '../note-shortcuts';
import { useSavePreference } from './use-save-preference';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

// The same menu DataViews uses for its own layout switcher, so the checkmark and the
// full-width group separator match what people already see there.
const { Menu } = unlock( privateApis );

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
			<Menu placement="bottom-end">
				<Menu.TriggerButton
					render={ <Button size="small" icon={ cog } label={ __( 'Settings' ) } /> }
				/>
				<Menu.Popover>
					{ isViewSettingsEnabled && (
						<>
							<Menu.Group>
								<Menu.GroupLabel>{ __( 'Layout' ) }</Menu.GroupLabel>
								{ LAYOUTS.map( ( { value, label } ) => (
									<Menu.RadioItem
										key={ value }
										name="notifications-layout-style"
										value={ value }
										checked={ layoutStyle === value }
										onChange={ () => setLayoutStyle( value ) }
									>
										<Menu.ItemLabel>{ label }</Menu.ItemLabel>
									</Menu.RadioItem>
								) ) }
							</Menu.Group>
							<Menu.Separator />
						</>
					) }
					<Menu.Group>
						{ /* ExternalLink supplies the arrow and the "opens in a new tab" label. It
						   wraps the item's own prefix and content wrappers in a span, so the icon
						   sits beside the label rather than in the menu's shared prefix column. */ }
						<Menu.Item
							render={ <ExternalLink href={ SETTINGS_URL } /> }
							prefix={ <Icon icon={ bell } size={ 20 } /> }
						>
							<Menu.ItemLabel>{ __( 'Notification settings' ) }</Menu.ItemLabel>
						</Menu.Item>
					</Menu.Group>
				</Menu.Popover>
			</Menu>
		</>
	);
}
