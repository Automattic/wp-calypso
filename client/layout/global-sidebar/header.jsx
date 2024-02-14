import { useTranslate } from 'i18n-calypso';
import SidebarNotifications from 'calypso/layout/global-sidebar/menu-items/notifications/notifications';
import SidebarSearch from 'calypso/layout/global-sidebar/menu-items/search/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<a href="/sites" className="link-logo">
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<SidebarSearch tooltip={ translate( 'Search' ) } />
			<SidebarNotifications
				isShowing={ false }
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Manage your notifications' ) }
			/>
		</div>
	);
};

export default GlobalSidebarHeader;
