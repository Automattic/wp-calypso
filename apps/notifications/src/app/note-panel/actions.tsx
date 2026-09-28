import { Button, DropdownMenu, Icon, privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, keyboard, settings } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from '../../panel/helpers/stats';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import getViewSettingsSeen from '../../panel/state/selectors/get-view-settings-seen';
import { useAppContext } from '../context';
import NoteShortcuts from '../note-shortcuts';
import LayoutTour from './layout-tour';
import { useSavePreference } from './use-save-preference';
import type { LayoutStyle } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

// The same menu DataViews uses for its own layout switcher, so the checkmark and the
// full-width group separator match what people already see there.
const { Menu } = unlock( privateApis );

const LAYOUTS: { value: LayoutStyle; label: string }[] = [
	{ value: 'detailed', label: __( 'Detailed' ) },
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
	// The dot reports that the simplified layout is the one in use. Unlike the DataViews
	// marker it resembles, it is not a "differs from default" signal: unset accounts start
	// on simplified, so most people carry the dot until they pick the detailed rows.
	const isSimplified = isViewSettingsEnabled && layoutStyle === 'simplified';
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );

	const markSeen = useCallback(
		() =>
			savePreference( {
				key: 'notifications-view-settings-seen',
				value: true,
				apply: () => actions.ui.setViewSettingsSeen( true ),
				revert: () => actions.ui.setViewSettingsSeen( false ),
			} ),
		[ savePreference ]
	);

	// Finding the menu unaided answers the tour. The preference can arrive after the menu
	// is already open, though, and until it does there is nothing to mark as seen — so
	// settle it here rather than only on the click that opened it.
	useEffect( () => {
		if ( isMenuOpen && isNew ) {
			markSeen();
		}
	}, [ isMenuOpen, isNew, markSeen ] );

	const setLayoutStyle = ( value: LayoutStyle ) => {
		recordTracksEvent( 'calypso_notification_layout_style_change', {
			from: layoutStyle,
			to: value,
		} );
		savePreference( {
			key: 'notifications-layout-style',
			value,
			apply: () => actions.ui.setLayoutStyle( value ),
			revert: () => actions.ui.setLayoutStyle( layoutStyle ),
		} );
	};

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
					// Render in place. Portalled to the body the popover's coordinates are
					// document-relative, so every scroll frame has to re-derive them from a
					// panel that is fixed to the viewport, and it visibly chases the page.
					inline: true,
				} }
			>
				{ () => <NoteShortcuts /> }
			</DropdownMenu>
			{ ! isViewSettingsEnabled && (
				<Button
					size="small"
					icon={ cog }
					label={ __( 'Settings' ) }
					onClick={ () => dispatch( actions.ui.viewSettings() ) }
				/>
			) }
			{ isViewSettingsEnabled && (
				<Menu
					placement="bottom-end"
					onOpenChange={ ( isOpen: boolean ) => {
						setIsMenuOpen( isOpen );
						if ( isOpen ) {
							recordTracksEvent( 'calypso_notification_settings_menu_open' );
						}
					} }
				>
					<Menu.TriggerButton
						render={
							<Button
								size="small"
								icon={ cog }
								label={ __( 'Settings' ) }
								className={ clsx( 'wpnc-app__settings-toggle', {
									'is-simplified': isSimplified,
								} ) }
							/>
						}
					/>
					<Menu.Popover modal={ false }>
						<Menu.Group>
							<Menu.GroupLabel>
								{ __( 'Layout' ) }
								<Badge className="wpnc-app__new-badge" intent="informational">
									{ __( 'New' ) }
								</Badge>
							</Menu.GroupLabel>
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
						<Menu.Group>
							<Menu.GroupLabel>{ __( 'Links' ) }</Menu.GroupLabel>
							<Menu.Item
								prefix={ <Icon icon={ settings } size={ 24 } /> }
								onClick={ () => dispatch( actions.ui.viewSettings() ) }
								// The arrow is decorative, so the new-tab hint rides on the name.
								aria-label={ __( 'Notification settings (opens in a new tab)' ) }
								suffix={ <span aria-hidden="true">&#8599;</span> }
							>
								<Menu.ItemLabel>{ __( 'Notification settings' ) }</Menu.ItemLabel>
							</Menu.Item>
						</Menu.Group>
					</Menu.Popover>
				</Menu>
			) }
			{ isNew && ! isMenuOpen && (
				<LayoutTour
					onDismiss={ () => {
						recordTracksEvent( 'calypso_notification_layout_tour_dismiss' );
						markSeen();
					} }
				/>
			) }
		</>
	);
}
