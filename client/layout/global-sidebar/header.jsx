import { useTranslate } from 'i18n-calypso';
import SidebarNotifications from './menu-items/notifications';
import SidebarSearch from './menu-items/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<a
				href="/sites"
				className="link-logo tooltip tooltip-bottom"
				data-tooltip={ translate( 'View all sites' ) }
			>
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<SidebarSearch tooltip={ translate( 'Jump to…' ) } />
			<SidebarNotifications
				isShowing={ false }
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Notifications' ) }
			/>
		</div>
	);
};

export default GlobalSidebarHeader;
