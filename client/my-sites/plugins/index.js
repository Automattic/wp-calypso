import page from 'page';
import { makeLayout, render } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	renderProvisionPlugins,
	jetpackCanUpdate,
	plugins,
	scrollTopIfNoHash,
	upload,
} from './controller';

export default function () {
	page(
		'/plugins/setup',
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		render
	);

	page(
		'/plugins/setup/:site',
		scrollTopIfNoHash,
		siteSelection,
		renderProvisionPlugins,
		makeLayout,
		render
	);

	page( '/plugins/browse/:siteOrCategory?', ( context ) => {
		const { siteOrCategory } = context.params;
		page.redirect( '/plugins' + ( siteOrCategory ? '/' + siteOrCategory : '' ) );
	} );

	page( '/plugins/upload', scrollTopIfNoHash, siteSelection, sites, makeLayout, render );
	page(
		'/plugins/upload/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		upload,
		makeLayout,
		render
	);

	page( '/plugins', scrollTopIfNoHash, siteSelection, sites, makeLayout, render );

	page(
		'/plugins/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		browsePlugins,
		makeLayout,
		render
	);

	page(
		'/plugins/manage/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		plugins,
		makeLayout,
		render
	);

	page(
		'/plugins/:pluginFilter(active|inactive|updates)/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		jetpackCanUpdate,
		plugins,
		makeLayout,
		render
	);

	page(
		'/plugins/:plugin/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		browsePluginsOrPlugin,
		makeLayout,
		render
	);
}
