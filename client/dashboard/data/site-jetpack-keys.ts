import wpcom from 'calypso/lib/wp';

interface RawJetpackPluginKeys {
	success: true;
	keys: {
		vaultpress?: string;
		akismet?: string;
	};
}

export interface JetpackPluginKey {
	slug: string;
	key: string;
}

export async function fetchJetpackKeys( siteId: number ): Promise< JetpackPluginKey[] > {
	const raw: RawJetpackPluginKeys = await wpcom.req.get( `/jetpack-blogs/${ siteId }/keys/` );
	const plugins: JetpackPluginKey[] = [];
	Object.entries( raw.keys ).forEach( ( [ slug, key ] ) => {
		plugins.push( { slug, key } );
	} );
	return plugins;
}
