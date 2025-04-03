import {
	__experimentalHStack as HStack,
	Button,
	Dropdown,
	Flex,
	FlexItem,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { help } from '@wordpress/icons';
import { useNavigate } from 'react-router-dom';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { BellIcon } from 'calypso/layout/masterbar/masterbar-notifications/notifications-bell-icon';
import './style.scss';

// User icon
const userIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-16c-3.314 0-6 2.686-6 6 0 2.458 1.47 4.577 3.58 5.519.018.007.035.016.052.025.844.396 1.787.456 2.368.456.581 0 1.524-.06 2.368-.456.017-.009.034-.018.052-.025C16.53 14.577 18 12.458 18 10c0-3.314-2.686-6-6-6z" />
	</svg>
);

// User profile dropdown component
function UserProfile() {
	const navigate = useNavigate();

	// Handler for navigating to different profile sections
	const navigateTo = ( path: string ) => () => {
		navigate( path );
	};

	return (
		<Dropdown
			className="dashboard-secondary-menu__user-dropdown"
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					onClick={ onToggle }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'My profile' ) }
					icon={ userIcon }
				/>
			) }
			renderContent={ () => (
				<div className="dashboard-secondary-menu__dropdown-content">
					<Flex className="dashboard-secondary-menu__user-info" direction="column" gap={ 2 }>
						<FlexItem>
							<strong>{ __( 'User Name' ) }</strong>
						</FlexItem>
						<FlexItem className="dashboard-secondary-menu__username">@username</FlexItem>
					</Flex>

					<MenuGroup label={ __( 'Account' ) }>
						<MenuItem onClick={ navigateTo( '/me/profile' ) }>{ __( 'Profile' ) }</MenuItem>
						<MenuItem onClick={ navigateTo( '/me/billing' ) }>{ __( 'Billing' ) }</MenuItem>
						<MenuItem onClick={ navigateTo( '/me/security' ) }>{ __( 'Security' ) }</MenuItem>
						<MenuItem onClick={ navigateTo( '/me/privacy' ) }>{ __( 'Privacy' ) }</MenuItem>
						<MenuItem onClick={ navigateTo( '/me/notifications' ) }>
							{ __( 'Notifications' ) }
						</MenuItem>
					</MenuGroup>

					<MenuGroup>
						<MenuItem
							onClick={ () => {
								console.log( 'Opening command palette' );
							} }
							role="menuitemcheckbox"
							shortcut="⌘K"
						>
							{ __( 'Command Palette' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								console.log( 'Switching theme' );
							} }
						>
							{ __( 'Theme' ) }
						</MenuItem>
					</MenuGroup>

					<div className="dashboard-secondary-menu__dropdown-actions">
						<Button
							variant="secondary"
							onClick={ () => {} }
							className="dashboard-secondary-menu__logout-button"
						>
							{ __( 'Log out' ) }
						</Button>
					</div>
				</div>
			) }
		/>
	);
}

function SecondaryMenu() {
	const navigate = useNavigate();

	// Navigation handlers
	const goToReader = () => navigate( '/reader' );
	const goToNotifications = () => navigate( '/notifications' );
	const openHelpCenter = () => {
		// Open help center action would go here
		console.log( 'Opening help center' );
	};

	return (
		<HStack spacing={ 3 } justify="flex-end">
			<Button
				icon={ <ReaderIcon className="masterbar__menu-icon masterbar_svg-reader" /> }
				label={ __( 'Reader' ) }
				text={ __( 'Reader' ) }
				onClick={ goToReader }
			/>
			<Button label={ __( 'Help' ) } onClick={ openHelpCenter } icon={ help } variant="tertiary" />
			<Button
				onClick={ goToNotifications }
				label={ __( 'Notifications' ) }
				icon={ <BellIcon newItems={ false } active={ false } /> }
				variant="tertiary"
			/>
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
