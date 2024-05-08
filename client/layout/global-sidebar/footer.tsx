import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { LocalizeProps } from 'i18n-calypso';
import { FC } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import QuickLanguageSwitcher from 'calypso/layout/masterbar/quick-language-switcher';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { isSupportSession } from 'calypso/state/support/selectors';
import { GLOBAL_SIDEBAR_EVENTS } from './events';
import SidebarMenuItem from './menu-items/menu-item';
import SidebarNotifications from './menu-items/notifications';
import { SidebarSearch } from './menu-items/search';

export const GlobalSidebarFooter: FC< {
	translate: LocalizeProps[ 'translate' ];
	user?: UserData;
} > = ( { translate, user } ) => {
	const hasEnTranslation = useHasEnTranslation();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );

	const isMac = window?.navigator.userAgent && window.navigator.userAgent.indexOf( 'Mac' ) > -1;
	const searchShortcut = isMac ? '⌘ + K' : 'Ctrl + K';

	return (
		<SidebarFooter>
			<SidebarMenuItem
				url="/me"
				className="sidebar__footer-link sidebar__footer-profile"
				tooltip={ translate( 'Profile' ) }
				tooltipPlacement="top"
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.PROFILE_CLICK ) }
			>
				<Gravatar user={ user } size={ 20 } />
			</SidebarMenuItem>
			<AsyncLoad
				require="./menu-items/help-center/help-center"
				tooltip={ translate( 'Help' ) }
				placeholder={
					<div className="link-help">
						<span className="help"></span>
					</div>
				}
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.HELPCENTER_CLICK ) }
			/>
			<SidebarSearch
				tooltip={
					hasEnTranslation( 'Search (%(shortcut)s)' )
						? translate( 'Search (%(shortcut)s)', { args: { shortcut: searchShortcut } } )
						: translate( 'Jump to…' )
				}
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.SEARCH_CLICK ) }
			/>
			<SidebarNotifications
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Notifications' ) }
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.NOTIFICATION_CLICK ) }
			/>
			{ isInSupportSession && (
				<QuickLanguageSwitcher className="sidebar__footer-language-switcher" shouldRenderAsButton />
			) }
		</SidebarFooter>
	);
};
