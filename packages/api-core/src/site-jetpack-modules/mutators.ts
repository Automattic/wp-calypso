import { wpcom } from '../wpcom-fetcher';

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
