import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Spinner,
	privateApis,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useState } from 'react';
import { useAnalytics } from './../../analytics';
import { useAuth } from './../../auth';
import { billingRoute, profileRoute, preferencesRoute, securityRoute } from './../../router/me';
import type { AnyRoute } from '@tanstack/react-router';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Menu } = unlock( privateApis );

export default function UserProfileDropdown(): JSX.Element {
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
