import { decodeEntities } from 'calypso/lib/formatting';
import type { SitePlugin, CorePlugin } from './types';

/**
 * Takes an array of objects and a list of fields to decode HTML entities from.
 * Iterates over each object, creates a new one with the same properties,
 * and decodes any HTML entities in the specified fields using decodeEntities().
 * Returns an array of the modified objects with the fields decoded.
 *
 * If no fields are provided, it defaults to decoding the 'name' field.
 * @param plugins - The array of objects to decode
 * @param fields - The fields to decode (defaults to ['name'])
 * @returns An array of the modified objects with the specified fields decoded
 */
const decodeEntitiesFromPlugins = < T >(
	plugins: T[],
	fields: ( keyof T )[] = [ 'name' as keyof T ]
): T[] => {
	return plugins.map( ( plugin ) => {
		const decodedPlugin: T = { ...plugin };

		fields.forEach( ( field ) => {
			if ( plugin?.hasOwnProperty( field ) ) {
				decodedPlugin[ field ] = decodeEntities( plugin[ field ] as string );
			}
		} );

		return decodedPlugin;
	} );
};

/**
 * Maps a SitePlugin object to a CorePlugin object.
 * @param plugin
 */
const mapToCorePlugin = ( plugin: SitePlugin ): Partial< CorePlugin > => {
	return {
		...plugin,
		plugin: plugin.id,
		status: plugin.active ? 'active' : 'inactive',
		plugin_uri: plugin.plugin_url,
		author_uri: plugin.author_url,
	};
};

/**
 * Maps a plugin property with a given extension.
 * @param plugin
 * @param ext
 */
const mapPluginExtension = ( plugin: CorePlugin, ext: string ): CorePlugin => ( {
	...plugin,
	plugin: plugin.plugin.endsWith( ext ) ? plugin.plugin : `${ plugin.plugin }${ ext }`,
} );

export { decodeEntitiesFromPlugins, mapToCorePlugin, mapPluginExtension };
