import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import SidebarNotifications from 'calypso/layout/global-sidebar/menu-items/notifications/notifications';
import SidebarSearch from 'calypso/layout/global-sidebar/menu-items/search/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<a href="/sites" className="link-logo">
				<span className="logo"></span>
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<SidebarSearch tooltip={ translate( 'Search' ) } />
			<AsyncLoad
				require="./menu-items/help-center/help-center"
				tooltip={ translate( 'Help' ) }
				placeholder={
					<div className="link-help">
						<span className="help"></span>
					</div>
				}
			/>
			<SidebarNotifications
				isShowing={ false }
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Manage your notifications' ) }
			>
				<span className="sidebar__item-notifications-label">{ translate( 'Notifications' ) }</span>
			</SidebarNotifications>
		</div>
	);
};

export default GlobalSidebarHeader;
