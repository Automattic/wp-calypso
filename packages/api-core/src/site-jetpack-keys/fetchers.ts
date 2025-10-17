import { wpcom } from '../wpcom-fetcher';
import type { JetpackPluginKey, RawJetpackPluginKeys } from './types';

export async function fetchJetpackKeys( siteId: number ): Promise< JetpackPluginKey[] > {
	const raw: RawJetpackPluginKeys = await wpcom.req.get( `/jetpack-blogs/${ siteId }/keys/` );
	const plugins: JetpackPluginKey[] = [];
	Object.entries( raw.keys ).forEach( ( [ slug, key ] ) => {
		plugins.push( { slug, key } );
	} );
	return plugins;
}
