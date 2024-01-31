import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import SidebarNotifications from 'calypso/my-sites/sidebar/menu-items/notifications/notifications';

export const MySitesSidebarUnifiedHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<a href="/sites" className="link-logo">
				<span className="logo"></span>
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<AsyncLoad
				require="./menu-items/search/search"
				tooltip={ translate( 'Search' ) }
				placeholder={
					<div className="link-search">
						<span className="search"></span>
					</div>
				}
			/>
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

export default MySitesSidebarUnifiedHeader;
