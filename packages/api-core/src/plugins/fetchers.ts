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
