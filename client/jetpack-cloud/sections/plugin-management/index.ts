import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { scrollTopIfNoHash } from 'calypso/my-sites/plugins/controller';
import { pluginManagementContext, pluginDetailsContext } from './controller';

export default function (): void {
	page( '/plugins', siteSelection, sites, makeLayout, clientRender );
	page(
		'/plugins/:filter(manage|active|inactive|updates)',
		pluginManagementContext,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/:filter(manage|active|inactive|updates)/:site',
		siteSelection,
		navigation,
		pluginManagementContext,
		makeLayout,
		clientRender
	);
	page( '/plugins/:plugin', scrollTopIfNoHash, pluginDetailsContext, makeLayout, clientRender );
	page(
		'/plugins/:plugin/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		pluginDetailsContext,
		makeLayout,
		clientRender
	);
}
