import languages, { Language } from '@automattic/languages';
import { stringify as stringifyQs } from 'qs';
import { WpOrgPlugin } from './types';

function getWporgLocaleCode( currentUserLocale: string ) {
	const result = languages.find( ( item ) => item.langSlug === currentUserLocale ) as Language;
	let wpOrgLocaleCode = result?.wpLocale || '';

	if ( wpOrgLocaleCode === '' ) {
		wpOrgLocaleCode = currentUserLocale;
	}

	return wpOrgLocaleCode;
}

async function getRequest( url: string, query: Record< string, string > ) {
	const response = await fetch( `${ url }?${ stringifyQs( query ) }`, {
		method: 'GET',
		headers: { Accept: 'application/json' },
	} );

	if ( response.ok ) {
		return await response.json();
	}

	return null;
}

const WPORG_PLUGINS_ENDPOINT = 'https://api.wordpress.org/plugins/info/1.2/';

/**
 * Fetches details for a particular plugin.
 * @param {string} pluginSlug The plugin identifier.
 * @param {string} locale The locale code.
 * @returns {Promise} Promise with the plugins details.
 */
export function fetchWpOrgPlugin( pluginSlug: string, locale: string ): Promise< WpOrgPlugin > {
	const query = {
		action: 'plugin_information',
		'request[slug]': pluginSlug.replace( new RegExp( '\\.php$' ), '' ),
		'request[locale]': getWporgLocaleCode( locale ),
		'request[fields]': 'icons,short_description,contributors,-added,-donate_link,-homepage',
	};

	return getRequest( WPORG_PLUGINS_ENDPOINT, query );
}

const WPORG_PLUGIN_DIRECTORY_ENDPOINT = 'https://wordpress.org/plugins/wp-json/wp/v2/plugin';

export const WPORG_ICONS_BATCH_SIZE = 100;

interface WpOrgDirectoryIcons {
	svg: string | false;
	icon: string | false;
	icon_2x: string | false;
	// True when the plugin has no icon and wp.org is serving its generated pattern.
	generated: boolean;
}

/**
 * Fetches real icon URLs for several wp.org plugins at once.
 *
 * Works around SEARCH-333, where the search index serves a generated pattern for
 * every wp.org plugin; delete once the index serves real URLs again. Rejects
 * rather than resolving empty, so a failure is retried instead of being cached
 * as "these plugins have no icon". Unrecognised slugs are dropped.
 * @param slugs plugin slugs, at most `WPORG_ICONS_BATCH_SIZE` of them
 * @returns icon URL by slug, omitting plugins with no icon of their own
 */
export async function fetchWpOrgPluginIcons(
	slugs: string[]
): Promise< Record< string, string > > {
	if ( ! slugs.length ) {
		return {};
	}

	// Beyond this, `per_page` truncates silently.
	if ( slugs.length > WPORG_ICONS_BATCH_SIZE ) {
		throw new Error(
			`fetchWpOrgPluginIcons accepts at most ${ WPORG_ICONS_BATCH_SIZE } slugs, got ${ slugs.length }`
		);
	}

	const query = stringifyQs(
		{ slug: slugs, per_page: WPORG_ICONS_BATCH_SIZE, _fields: 'slug,icons' },
		{ arrayFormat: 'brackets' }
	);

	const response = await fetch( `${ WPORG_PLUGIN_DIRECTORY_ENDPOINT }?${ query }`, {
		method: 'GET',
		headers: { Accept: 'application/json' },
	} );

	if ( ! response.ok ) {
		// `status` is what the shared retry predicate reads to stop retrying a 4xx.
		throw Object.assign( new Error( `wp.org plugin directory responded ${ response.status }` ), {
			status: response.status,
			statusCode: response.status,
		} );
	}

	const plugins: { slug: string; icons?: WpOrgDirectoryIcons }[] = await response.json();

	if ( ! Array.isArray( plugins ) ) {
		throw new Error( 'wp.org plugin directory returned an unexpected body' );
	}

	return plugins.reduce< Record< string, string > >( ( icons, { slug, icons: pluginIcons } ) => {
		if ( ! pluginIcons || pluginIcons.generated ) {
			return icons;
		}

		// `icon` is 128px, plenty at the sizes these render, and lighter than `icon_2x`.
		const url = pluginIcons.svg || pluginIcons.icon || pluginIcons.icon_2x;

		if ( url ) {
			icons[ slug ] = url;
		}

		return icons;
		// Null-prototype: a slug like `constructor` must not hit `Object.prototype`.
	}, Object.create( null ) );
}
