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
import { useHref, useLinkClickHandler } from 'react-router-dom';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import './style.scss';

function NavMenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const handleClick = useLinkClickHandler< HTMLButtonElement >( to );
	const href = useHref( to );
	return (
		<MenuItem href={ href } onClick={ handleClick } __next40pxDefaultSize>
			{ children }
		</MenuItem>
	);
}

// User profile dropdown component
function UserProfile() {
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
					icon={ commentAuthorAvatar }
				/>
			) }
			renderContent={ () => (
				<VStack>
					<VStack style={ { padding: '16px', borderBottom: '1px solid #ccc' } }>
						<Text>{ __( 'User Name' ) }</Text>
						<Text>@username</Text>
					</VStack>
					<MenuGroup>
						<NavMenuItem to="/me/profile">{ __( 'Profile' ) }</NavMenuItem>
						<NavMenuItem to="/me/billing">{ __( 'Billing' ) }</NavMenuItem>
						<NavMenuItem to="/me/security">{ __( 'Security' ) }</NavMenuItem>
						<NavMenuItem to="/me/privacy">{ __( 'Privacy' ) }</NavMenuItem>
						<NavMenuItem to="/me/notifications">{ __( 'Notifications' ) }</NavMenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem onClick={ () => {} } shortcut="⌘K">
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
	const hasUnreadNotifications = false;
	const readerPath = '/reader';
	const notificationsPath = '/me/notifications';

	const openHelpCenter = () => {
		// Open help center action would go here
	};

	return (
		<HStack spacing={ 3 } justify="flex-end">
			<Button
				className="dashboard-secondary-menu__item"
				icon={ <ReaderIcon /> }
				label={ __( 'Reader' ) }
				text={ __( 'Reader' ) }
				onClick={ useLinkClickHandler( readerPath ) }
				href={ useHref( readerPath ) }
			/>
			<div className="dashboard-secondary-menu__divider" />
			<Button
				className="dashboard-secondary-menu__item"
				label={ __( 'Help' ) }
				onClick={ openHelpCenter }
				icon={ help }
				variant="tertiary"
			/>
			<Button
				className="dashboard-secondary-menu__item"
				label={ __( 'Notifications' ) }
				icon={ hasUnreadNotifications ? bellUnread : bell }
				variant="tertiary"
				onClick={ useLinkClickHandler( notificationsPath ) }
				href={ useHref( notificationsPath ) }
			/>
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
