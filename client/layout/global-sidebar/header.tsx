import { useTranslate } from 'i18n-calypso';
import SkipNavigation from '../sidebar/skip-navigation';
import SidebarNotifications from './menu-items/notifications';
import { SidebarSearch } from './menu-items/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<SkipNavigation
				skipToElementId="primary"
				displayText={ translate( 'Skip to main content' ) }
			/>
			<a
				href="/sites"
				className="link-logo tooltip tooltip-bottom-left"
				data-tooltip={ translate( 'View all sites' ) }
			>
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<SidebarSearch tooltip={ translate( 'Jump to…' ) } />
			<SidebarNotifications
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Notifications' ) }
			/>
		</div>
	);
};
