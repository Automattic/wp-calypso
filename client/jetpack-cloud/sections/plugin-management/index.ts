import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { scrollTopIfNoHash, renderPluginsDashboard } from 'calypso/my-sites/plugins/controller';
import { pluginManagementContext, pluginDetailsContext } from './controller';

export default function (): void {
	page( '/plugins', siteSelection, sites, makeLayout, clientRender );

	page(
		'/plugins/manage/sites',
		scrollTopIfNoHash,
		navigation,
		pluginManagementContext,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/manage/sites/:slug',
		scrollTopIfNoHash,
		navigation,
		pluginManagementContext,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/manage/:site',
		scrollTopIfNoHash,
		navigation,
		pluginManagementContext,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);

	page( '/plugins/:plugin', scrollTopIfNoHash, pluginDetailsContext, makeLayout, clientRender );
}
