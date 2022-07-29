import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import {
	browsePlugins,
	browsePluginsOrPlugin,
	fetchPlugins,
	fetchPlugin,
	fetchCategoryPlugins,
} from './controller-2';

export default function ( router ) {
	router(
		'/plugins/browse/:category',
		ssrSetupLocale,
		fetchCategoryPlugins,
		browsePlugins,
		makeLayout
	);

	router( '/plugins', ssrSetupLocale, fetchPlugins, browsePlugins, makeLayout );

	router( '/plugins/:plugin', ssrSetupLocale, fetchPlugin, browsePluginsOrPlugin, makeLayout );
}
