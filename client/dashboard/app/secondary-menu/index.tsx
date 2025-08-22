import config from '@automattic/calypso-config';
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
import { help, commentAuthorAvatar } from '@wordpress/icons';
import { Suspense, lazy, useCallback } from 'react';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { useAuth } from '../auth';
import { useOpenCommandPalette } from '../command-palette/utils';
import { useAppContext } from '../context';
import { useHelpCenter } from '../help-center';
import Notifications from '../notifications';

import './style.scss';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

function Help() {
	const { user } = useAuth();
	const { isLoading, isShown, setShowHelpCenter } = useHelpCenter();

	const handleToggleHelpCenter = () => {
		setShowHelpCenter( ! isShown );
	};

	const handleCloseHelpCenterApp = useCallback( () => {
		setShowHelpCenter( false, undefined, undefined, true );
	}, [ setShowHelpCenter ] );

	return (
		<>
			<Button
				className="dashboard-secondary-menu__item"
				label={ __( 'Help' ) }
				icon={ help }
				variant="tertiary"
				isBusy={ isLoading }
				onClick={ handleToggleHelpCenter }
			/>
			<Suspense fallback={ null }>
				{ isShown && (
					<AsyncHelpCenterApp
						currentUser={ user }
						handleClose={ handleCloseHelpCenterApp }
						locale={ user.language }
						onboardingUrl={ config( 'wpcom_signup_url' ) }
						sectionName="dashboard"
					/>
				) }
			</Suspense>
		</>
	);
}

// User profile dropdown component
function UserProfile() {
	const { user } = useAuth();
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
						<RouterLinkMenuItem to="/me/profile" onClick={ onClose }>
							{ __( 'Account' ) }
						</RouterLinkMenuItem>
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

	return (
		<HStack spacing={ 2 } justify="flex-end">
			{ supports.reader && (
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ __( 'Reader' ) }
					href="/reader"
				/>
			) }
			{ supports.help && <Help /> }
			{ supports.notifications && <Notifications className="dashboard-secondary-menu__item" /> }
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
