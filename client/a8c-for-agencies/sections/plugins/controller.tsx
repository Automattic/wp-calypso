import page from '@automattic/calypso-router';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { A4A_PLUGINS_LINK } from '../../components/sidebar-menu/lib/constants';
import MainSidebar from '../../components/sidebar-menu/main';

export const pluginsContext: Callback = ( context ) => {
	const { slug } = context.params;
	const redirectPath = slug
		? `${ A4A_PLUGINS_LINK }/manage/sites/${ slug }`
		: `${ A4A_PLUGINS_LINK }/manage/sites`;

	page.redirect( redirectPath );
};

export const pluginManagementContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Plugins" path={ context.path } />
		</>
	);
	next();
};

export const pluginDetailsContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Plugins" path={ context.path } />
		</>
	);
	next();
};
