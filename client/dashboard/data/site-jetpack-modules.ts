import wpcom from 'calypso/lib/wp';

export async function fetchJetpackModules( siteId: number ) {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/module/all/',
	} );

	const modules = Object.entries( data )
		.filter( ( [ , properties ] ) => ( properties as { activated?: boolean } ).activated )
		.map( ( [ name ] ) => name );

	return modules;
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
