import { Button, DropdownMenu, privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, keyboard } from '@wordpress/icons';
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
// help text under each option match what people already see there.
const { Menu } = unlock( privateApis );

const SETTINGS_URL = 'https://wordpress.com/me/notifications';

const LAYOUTS = [
	{
		value: 'classic',
		label: __( 'Classic' ),
		help: __( 'Each notification spelled out in a full sentence.' ),
	},
	{
		value: 'simplified',
		label: __( 'Simplified' ),
		help: __( 'Fewer words, leading with what happened.' ),
	},
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
						<Menu.Group>
							<Menu.GroupLabel>{ __( 'Layout' ) }</Menu.GroupLabel>
							{ LAYOUTS.map( ( { value, label, help } ) => (
								<Menu.RadioItem
									key={ value }
									name="notifications-layout-style"
									value={ value }
									checked={ layoutStyle === value }
									onChange={ () => setLayoutStyle( value ) }
								>
									<Menu.ItemLabel>{ label }</Menu.ItemLabel>
									<Menu.ItemHelpText>{ help }</Menu.ItemHelpText>
								</Menu.RadioItem>
							) ) }
						</Menu.Group>
					) }
					<Menu.Group>
						<Menu.Item
							render={ <a href={ SETTINGS_URL } target="_blank" rel="noopener noreferrer" /> }
						>
							<Menu.ItemLabel>{ __( 'Notification settings' ) }</Menu.ItemLabel>
						</Menu.Item>
					</Menu.Group>
				</Menu.Popover>
			</Menu>
		</>
	);
}
