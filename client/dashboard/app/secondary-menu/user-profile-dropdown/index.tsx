import { User } from '@automattic/api-core';
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

interface UserProfileDropdownProps {
	user: User;
	logout: () => Promise< void >;
	navigateTo: ( path: string ) => void;
	recordTracksEvent: ( eventName: string, args?: Record< string, unknown > ) => void;
}

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Menu } = unlock( privateApis );

export default function UserProfileDropdown( props: UserProfileDropdownProps ): JSX.Element {
	const { user, logout, navigateTo, recordTracksEvent } = props;
	const [ isLoggingOut, setIsLoggingOut ] = useState( false );

	const handleAccountItemClick = ( path: string ): void => {
		navigateTo( path );
		recordTracksEvent( 'calypso_dashboard_user_profile_menu_item_click', { path: path } );
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
					<Menu.Item onClick={ () => handleAccountItemClick( '/me/profile' ) }>
						<Menu.ItemLabel>{ __( 'Profile' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( '/me/preferences' ) }>
						<Menu.ItemLabel>{ __( 'Preferences' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( '/me/billing' ) }>
						<Menu.ItemLabel>{ __( 'Billing' ) }</Menu.ItemLabel>
					</Menu.Item>
					<Menu.Item onClick={ () => handleAccountItemClick( '/me/security' ) }>
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
