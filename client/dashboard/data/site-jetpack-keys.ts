import wpcom from 'calypso/lib/wp';

export interface JetpackPluginKeys {
	success: true;
	keys: {
		vaultpress?: string;
		akismet?: string;
	};
}

export async function fetchJetpackKeys( siteId: number ): Promise< JetpackPluginKeys > {
	return wpcom.req.get( `/jetpack-blogs/${ siteId }/keys/` );
}
