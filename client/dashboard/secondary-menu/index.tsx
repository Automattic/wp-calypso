import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { help, bellUnread, bell, commentAuthorAvatar } from '@wordpress/icons';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { useAppContext } from '../app/context';
import { useAuth } from '../auth';
import { useOpenCommandPalette } from '../command-palette/utils';
import MenuDivider from '../menu-divider';
import './style.scss';

// User profile dropdown component
function UserProfile() {
	const { user } = useAuth();
	const { supports } = useAppContext();
	const openCommandPalette = useOpenCommandPalette();

	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="dashboard-secondary-menu__item"
					onClick={ onToggle }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'My profile' ) }
					icon={
						user.avatar_URL ? (
							<img
								className="dashboard-secondary-menu__avatar"
								src={ user.avatar_URL }
								alt={ __( 'User avatar' ) }
							/>
						) : (
							commentAuthorAvatar
						)
					}
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<VStack>
					<VStack style={ { padding: '16px', borderBottom: '1px solid #ccc' } } spacing={ 1 }>
						<Text>{ user.display_name }</Text>
						<Text variant="muted">@{ user.username }</Text>
					</VStack>
					<MenuGroup>
						{ /* @ts-expect-error -- href is supported by MenuItem, the types are not correct. */ }
						<MenuItem href="me/profile" __next40pxDefaultSize>
							{ __( 'Profile' ) }
						</MenuItem>
						{ /* @ts-expect-error -- href is supported by MenuItem, the types are not correct. */ }
						<MenuItem href="me/billing" __next40pxDefaultSize>
							{ __( 'Billing' ) }
						</MenuItem>
						{ /* @ts-expect-error -- href is supported by MenuItem, the types are not correct. */ }
						<MenuItem href="me/security" __next40pxDefaultSize>
							{ __( 'Security' ) }
						</MenuItem>
						{ /* @ts-expect-error -- href is supported by MenuItem, the types are not correct. */ }
						<MenuItem href="me/privacy" __next40pxDefaultSize>
							{ __( 'Privacy' ) }
						</MenuItem>
						{ supports.notifications && (
							// @ts-expect-error -- href is supported by MenuItem, the types are not correct
							<MenuItem href="me/notifications" __next40pxDefaultSize>
								{ __( 'Notifications' ) }
							</MenuItem>
						) }
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								// First close the dropdown
								onClose();
								// Then open the command palette after a tiny delay
								// to ensure the dropdown is fully closed
								requestAnimationFrame( () => {
									openCommandPalette();
								} );
							} }
							shortcut="⌘K"
						>
							{ __( 'Command Palette' ) }
						</MenuItem>
						<MenuItem onClick={ () => {} }>{ __( 'Theme' ) }</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem onClick={ () => {} }>{ __( 'Log out' ) }</MenuItem>
					</MenuGroup>
				</VStack>
			) }
		/>
	);
}

function SecondaryMenu() {
	const { supports } = useAppContext();
	const hasUnreadNotifications = false;

	const openHelpCenter = () => {
		// Open help center action would go here
	};

	return (
		<HStack spacing={ 3 } justify="flex-end">
			{ supports.reader && (
				<>
					<Button
						className="dashboard-secondary-menu__item"
						icon={ <ReaderIcon /> }
						label={ __( 'Reader' ) }
						text={ __( 'Reader' ) }
						href="/reader"
					/>
					<MenuDivider />
				</>
			) }
			{ supports.help && (
				<Button
					className="dashboard-secondary-menu__item"
					label={ __( 'Help' ) }
					onClick={ openHelpCenter }
					icon={ help }
					variant="tertiary"
				/>
			) }
			{ supports.notifications && (
				<Button
					className="dashboard-secondary-menu__item"
					label={ __( 'Notifications' ) }
					icon={ hasUnreadNotifications ? bellUnread : bell }
					variant="tertiary"
					href="me/notifications"
				/>
			) }
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
