import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getSectionName } from 'calypso/state/ui/selectors';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SkipNavigation from '../sidebar/skip-navigation';
import { GLOBAL_SIDEBAR_EVENTS } from './events';
import SidebarNotifications from './menu-items/notifications';
import { SidebarSearch } from './menu-items/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	return (
		<div className="sidebar__header">
			<SkipNavigation
				skipToElementId="primary"
				displayText={ translate( 'Skip to main content' ) }
			/>
			{ sectionName === 'sites-dashboard' ? (
				<span className="dotcom"></span>
			) : (
				<a
					href="/sites"
					className="link-logo tooltip tooltip-bottom-left"
					data-tooltip={ translate( 'View all sites' ) }
					onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.ALLSITES_CLICK ) }
				>
					<span className="dotcom"></span>
				</a>
			) }
			<span className="gap"></span>
			<SidebarSearch
				tooltip={ translate( 'Jump to…' ) }
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.SEARCH_CLICK ) }
			/>
			<SidebarNotifications
				isActive={ true }
				className="sidebar__item-notifications"
				tooltip={ translate( 'Notifications' ) }
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.NOTIFICATION_CLICK ) }
			/>
		</div>
	);
};
