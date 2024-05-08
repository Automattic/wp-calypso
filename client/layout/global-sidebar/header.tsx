import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import SkipNavigation from '../sidebar/skip-navigation';
import { GLOBAL_SIDEBAR_EVENTS } from './events';
import SidebarMenuItem from './menu-items/menu-item';

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
				<SidebarMenuItem
					url="/sites"
					className="link-logo"
					tooltip={ translate( 'View all sites' ) }
					tooltipPlacement="bottom"
					onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.ALLSITES_CLICK ) }
					icon={ <span className="dotcom"></span> }
				/>
			) }
		</div>
	);
};
