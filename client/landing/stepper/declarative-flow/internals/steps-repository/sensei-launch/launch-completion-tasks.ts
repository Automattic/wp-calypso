import wp from 'calypso/lib/wp';

const PERSISTENT_DATA_DELAY = 1200;

function waitMs( ms: number ) {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			resolve( null );
		}, ms );
	} );
}

export const setAdminInterfaceStyle = async ( siteId: number | string, interfaceName: string ) => {
	let response = false;

	try {
		response = await wp.req.post(
			{
				path: `/sites/${ siteId }/hosting/admin-interface`,
				apiNamespace: 'wpcom/v2',
			},
			{
				interface: interfaceName,
			}
		);

		// Wait for persistent data to be updated on the atomic server
		await waitMs( PERSISTENT_DATA_DELAY );
	} catch ( e ) {
		response = false;
	}

	return response;
};
