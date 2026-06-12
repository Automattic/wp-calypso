import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	bell,
	buttons,
	commentAuthorAvatar,
	lock,
	notAllowed,
	payment,
	settings,
} from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import type { AppConfig, MeSupports } from '../../app/context';

import './style.scss';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return supports.me && supports.me[ feature ];
};

export default function MeSidebar() {
	const { data: userSettings } = useQuery( userSettingsQuery() );

	if ( ! userSettings ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<HStack justify="flex-start" alignment="center" spacing={ 3 }>
				<div className="me-sidebar__avatar-wrapper">
					<div className="me-sidebar__avatar">
						<img src={ userSettings.avatar_URL } alt={ __( 'Profile photo' ) } />
					</div>
				</div>
				<VStack spacing={ 0 } style={ { minWidth: 0 } }>
					<Text weight={ 500 } size="13px" truncate numberOfLines={ 1 }>
						{ userSettings.display_name }
					</Text>
					<Text variant="muted" size="12px" truncate numberOfLines={ 1 }>
						{ `@${ userSettings.user_login }` }
					</Text>
				</VStack>
			</HStack>
			<MeMenuSidebar />
		</VStack>
	);
}

function MeMenuSidebar() {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ commentAuthorAvatar } to="/me/account">
				{ __( 'Account' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ settings } to="/me/preferences">
				{ __( 'Preferences' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ payment } to="/me/billing">
				{ __( 'Billing' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ lock } to="/me/security">
				{ __( 'Security' ) }
			</SidebarMenuItem>
			{ supports.notifications && (
				<SidebarMenuItem icon={ bell } to="/me/notifications">
					{ __( 'Notifications' ) }
				</SidebarMenuItem>
			) }
			{ supports.reader && (
				<SidebarMenuItem icon={ notAllowed } to="/me/blocked-sites">
					{ __( 'Blocked sites' ) }
				</SidebarMenuItem>
			) }
			{ hasAppSupport( supports, 'apps' ) && (
				<SidebarMenuItem icon={ buttons } to="/me/apps">
					{ __( 'Apps' ) }
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
}
