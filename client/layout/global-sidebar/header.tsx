import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import SkipNavigation from '../sidebar/skip-navigation';
import { GLOBAL_SIDEBAR_EVENTS } from './events';
import SidebarMenuItem from './menu-items/menu-item';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();

	return (
		<div className="sidebar__header">
			<SkipNavigation
				skipToElementId="primary"
				displayText={ translate( 'Skip to main content' ) }
			/>
			<SidebarMenuItem
				url="/sites"
				className="link-logo"
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.ALLSITES_CLICK ) }
				icon={ <span className="dotcom"></span> }
			/>
		</div>
	);
};
