import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import { A4A_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import MainSidebar from '../../components/sidebar-menu/main';
import { SETTINGS_AGENCY_PROFILE_TAB } from './constants';
import Settings from './settings';

export const settingsContext: Callback = ( context, next ) => {
	const validTabs = [ SETTINGS_AGENCY_PROFILE_TAB ];
	if ( ! validTabs.includes( context.params.tab ) ) {
		page.redirect( A4A_SETTINGS_LINK );
		return;
	}

	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Settings" path={ context.path } />
			<Settings selectedTab={ context.params.tab } />
		</>
	);

	next();
};
