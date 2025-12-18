import config from '@automattic/calypso-config';
import { useShouldUseUnifiedAgent } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Spinner,
	privateApis,
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
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Suspense, lazy, useCallback, useState } from 'react';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { useExperiment } from 'calypso/lib/explat';
import { wpcomLink } from '../../utils/link';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { useAppContext } from '../context';
import { useHelpCenter } from '../help-center';
import Notifications from '../notifications';
import { billingRoute, profileRoute, preferencesRoute, securityRoute } from '../router/me';
import type { AnyRoute } from '@tanstack/react-router';

import './style.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Menu } = unlock( privateApis );
const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

function Help() {
	const { user } = useAuth();
	const { isLoading, isShown, setShowHelpCenter, setNavigateToRoute } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const [ helpCenterPage, setHelpCenterPage ] = useState( '' );
	const isUnifiedAgentEnabled = useShouldUseUnifiedAgent();

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_help_center_menu_popover_v2'
	);
	const isMenuPanelExperimentEnabled =
		! isLoadingExperimentAssignment && experimentAssignment?.variationName === 'menu_popover';

	const trackIconInteraction = () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown,
			section: 'dashboard',
			is_menu_panel_enabled: isMenuPanelExperimentEnabled,
			is_assignment_loaded: ! isLoadingExperimentAssignment,
		} );
	};

	const handleToggleHelpCenter = () => {
		trackIconInteraction();
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

	if ( isMenuPanelExperimentEnabled ) {
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
					onToggle={ trackIconInteraction }
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
				{ ( isShown || isUnifiedAgentEnabled ) && (
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
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const [ isLoggingOut, setIsLoggingOut ] = useState( false );

	const handleAccountItemClick = ( itemId: string ) => {
		let route: AnyRoute | undefined;
		switch ( itemId ) {
			case 'billing':
				route = billingRoute;
				break;
			case 'profile':
				route = profileRoute;
				break;
			case 'preferences':
				route = preferencesRoute;
				break;
			case 'security':
				route = securityRoute;
				break;
		}

		if ( ! route ) {
			return;
		}

		navigate( { to: route.fullPath } );
		recordTracksEvent( 'calypso_dashboard_user_profile_menu_item_click', { item_id: itemId } );
	};

	return (
		<Menu>
			<Menu.TriggerButton
				render={
					<Button
						className="dashboard-secondary-menu__item"
						label={ __( 'My profile' ) }
						variant="tertiary"
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
				}
			/>
			<Menu.Popover style={ { minWidth: '250px' } }>
				<VStack style={ { gridColumn: '1 / -1', padding: '8px 12px' } } spacing={ 1 }>
					<Text>{ user.display_name }</Text>
					<Text variant="muted">@{ user.username }</Text>
				</VStack>
				<Menu.Separator />
				<Menu.Group>
					<Menu.GroupLabel>{ __( 'Account' ) }</Menu.GroupLabel>
					<Menu.Item onClick={ () => handleAccountItemClick( 'profile' ) }>
						<Menu.ItemLabel>{ __( 'Profile' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( 'preferences' ) }>
						<Menu.ItemLabel>{ __( 'Preferences' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( 'billing' ) }>
						<Menu.ItemLabel>{ __( 'Billing' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( 'security' ) }>
						<Menu.ItemLabel>{ __( 'Security' ) }</Menu.ItemLabel>
					</Menu.Item>
				</Menu.Group>
				<Menu.Separator />
				<Menu.Group>
					<Menu.Item
						disabled={ isLoggingOut }
						hideOnClick={ false }
						onClick={ () => {
							setIsLoggingOut( true );
							logout().catch( () => setIsLoggingOut( false ) );
						} }
					>
						<Menu.ItemLabel>
							<HStack justify="left">
								<span>{ isLoggingOut ? __( 'Logging out…' ) : __( 'Log out' ) }</span>
								{ isLoggingOut && (
									<Spinner style={ { width: 16, height: 16, padding: 4, margin: 0 } } />
								) }
							</HStack>
						</Menu.ItemLabel>
					</Menu.Item>
				</Menu.Group>
			</Menu.Popover>
		</Menu>
	);
}

function SecondaryMenu() {
	const { supports } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HStack spacing={ isDesktop ? 2 : 0 } justify="flex-end">
			{ supports.reader && (
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ isDesktop ? __( 'Reader' ) : undefined }
					href={ wpcomLink( '/reader' ) }
				/>
			) }
			{ supports.help && <Help /> }
			{ supports.notifications && <Notifications className="dashboard-secondary-menu__item" /> }
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
