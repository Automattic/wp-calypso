import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Spinner,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	comment,
	backup,
	page,
	video,
	rss,
	help,
	commentAuthorAvatar,
} from '@wordpress/icons';
import { Suspense, lazy, useCallback, useState } from 'react';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { useOpenCommandPalette } from '../command-palette/utils';
import { useAppContext } from '../context';
import { useHelpCenter } from '../help-center';
import Notifications from '../notifications';

import './style.scss';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

function Help() {
	const { user } = useAuth();
	const { isLoading, isShown, setShowHelpCenter, setNavigateToRoute } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const isMenuPanelEnabled = config.isEnabled( 'help-center-menu-panel' );
	const [ helpCenterPage, setHelpCenterPage ] = useState( '' );

	const handleToggleHelpCenter = () => {
		setShowHelpCenter( ! isShown );
	};

	const handleCloseHelpCenterApp = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	const handleMenuClick = ( destination: string, isExternal = false ) => {
		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: 'dashboard',
			destination,
			help_center_visible: isShown,
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		if ( isShown ) {
			if ( destination !== helpCenterPage ) {
				setNavigateToRoute( destination );
				setHelpCenterPage( destination );
			} else {
				setShowHelpCenter( false );
				setHelpCenterPage( '' );
				recordTracksEvent( 'calypso_inlinehelp_close', {
					force_site_id: true,
					location: 'help-center',
					section: 'dashboard',
				} );
			}
		} else {
			setNavigateToRoute( destination );
			setHelpCenterPage( destination );
			setShowHelpCenter( true );

			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
				location: 'help-center',
				section: 'dashboard',
				destination,
			} );
		}
	};

	if ( isMenuPanelEnabled ) {
		return (
			<>
				<DropdownMenu
					popoverProps={ {
						placement: 'bottom-end',
						offset: 8,
					} }
					label={ __( 'Help' ) }
					icon={ help }
					toggleProps={ {
						className: 'dashboard-secondary-menu__item',
						variant: 'tertiary',
					} }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/odie' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ comment } size={ 24 } />
										<span>{ __( 'Chat support' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/chat-history' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ backup } size={ 24 } />
										<span>{ __( 'Chat history' ) }</span>
									</HStack>
								</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/support-guides' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ page } size={ 24 } />
										<span>{ __( 'Support guides' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick(
											localizeUrl( 'https://wordpress.com/support/courses/' ),
											true
										);
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ video } size={ 24 } />
										<span>{ __( 'Courses' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick(
											localizeUrl( 'https://wordpress.com/blog/category/product-features/' ),
											true
										);
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ rss } size={ 24 } />
										<span>{ __( 'Product updates' ) }</span>
									</HStack>
								</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
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
	const { user, logout } = useAuth();
	const { supports } = useAppContext();
	const openCommandPalette = useOpenCommandPalette();
	const [ isLoggingOut, setIsLoggingOut ] = useState( false );

	return (
		<DropdownMenu
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
			} }
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
			toggleProps={ {
				className: 'dashboard-secondary-menu__item',
				variant: 'tertiary',
			} }
		>
			{ ( { onClose } ) => (
				<VStack spacing={ 0 }>
					<VStack style={ { padding: '16px', borderBottom: '1px solid #ccc' } } spacing={ 1 }>
						<Text>{ user.display_name }</Text>
						<Text variant="muted">@{ user.username }</Text>
					</VStack>
					<MenuGroup>
						<RouterLinkMenuItem to="/me/profile" onClick={ onClose }>
							{ __( 'Account' ) }
						</RouterLinkMenuItem>
					</MenuGroup>
					{ supports.commandPalette && (
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
								{ __( 'Command palette' ) }
							</MenuItem>
						</MenuGroup>
					) }
					<MenuGroup>
						<MenuItem
							disabled={ isLoggingOut }
							onClick={ () => {
								setIsLoggingOut( true );
								logout().catch( () => setIsLoggingOut( false ) );
							} }
						>
							<HStack justify="left">
								<span>{ isLoggingOut ? __( 'Logging out…' ) : __( 'Log out' ) }</span>
								{ isLoggingOut && (
									<Spinner style={ { width: 24, height: 24, padding: 4, margin: 0 } } />
								) }
							</HStack>
						</MenuItem>
					</MenuGroup>
				</VStack>
			) }
		</DropdownMenu>
	);
}

function SecondaryMenu() {
	const { supports } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HStack spacing={ 2 } justify="flex-end">
			{ supports.reader && (
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ isDesktop ? __( 'Reader' ) : undefined }
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
