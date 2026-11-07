import { Button, Icon, privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog, settings } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from '../../panel/helpers/stats';
import actions from '../../panel/state/actions';
import getLayoutStyle from '../../panel/state/selectors/get-layout-style';
import { useAppContext } from '../context';
import NoteShortcuts from '../note-shortcuts';
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
	const layoutStyle = useSelector( getLayoutStyle );
	const { isViewSettingsEnabled } = useAppContext();
	const savePreference = useSavePreference();

	// The dot reports that the simplified layout is the one in use. Unlike the DataViews
	// marker it resembles, it is not a "differs from default" signal: unset accounts start
	// on simplified, so most people carry the dot until they pick the detailed rows.
	const isSimplified = isViewSettingsEnabled && layoutStyle === 'simplified';

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
			<NoteShortcuts />
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
					<Menu.Popover
						modal={ false }
						onKeyDown={ ( event: React.KeyboardEvent ) => event.stopPropagation() }
					>
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
		</>
	);
}
