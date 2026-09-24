import wpcomRequest from 'wpcom-proxy-request';
import type { PluginRecommendation } from '../../abilities/render-plugin-recommendations';

export interface CatalogPlugin {
	name: string;
}

function asPlugin( data: unknown ): CatalogPlugin | null {
	return data &&
		typeof data === 'object' &&
		'name' in data &&
		typeof data.name === 'string' &&
		data.name.trim()
		? { name: data.name }
		: null;
}

export async function fetchRecommendation(
	pick: Pick< PluginRecommendation, 'slug' | 'source' >,
	locale: string
): Promise< CatalogPlugin | null > {
	if ( pick.source !== 'commercial' ) {
		try {
			const query = new URLSearchParams( {
				action: 'plugin_information',
				'request[slug]': pick.slug,
				'request[locale]': locale,
			} );
			const response = await fetch( `https://api.wordpress.org/plugins/info/1.2/?${ query }` );
			if ( ! response.ok ) {
				throw new Error( 'Unable to load plugin.' );
			}
			const plugin = asPlugin( await response.json() );
			if ( plugin || pick.source === 'wporg' ) {
				return plugin;
			}
		} catch ( error ) {
			if ( pick.source === 'wporg' ) {
				throw error;
			}
		}
	}
	return asPlugin(
		await wpcomRequest( {
			path: `/marketplace/products/${ pick.slug }`,
			apiNamespace: 'wpcom/v2',
		} )
	);
}
