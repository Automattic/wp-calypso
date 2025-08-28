import wpcom from 'calypso/lib/wp';

export interface JetpackModule {
	activated: boolean;
	available: boolean;
	name: string;
	requires_connection: boolean;
	[ key: string ]: unknown;
}

export async function fetchJetpackModules(
	siteId: number
): Promise< Record< string, JetpackModule > > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/module/all/',
	} );

	return data;
}

export async function activateJetpackModule( siteId: number, module: string ) {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: `/jetpack/v4/module/${ module }/active/`,
		body: JSON.stringify( { active: true } ),
	} );
}

export async function deactivateJetpackModule( siteId: number, module: string ) {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: `/jetpack/v4/module/${ module }/active/`,
		body: JSON.stringify( { active: false } ),
	} );
}
