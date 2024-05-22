import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import Settings from './settings';

export const settingsContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Settings" path={ context.path } />
			<Settings tab={ context.params.tab } />
		</>
	);

	next();
};
