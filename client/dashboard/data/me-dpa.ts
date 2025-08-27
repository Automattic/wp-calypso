import wpcom from 'calypso/lib/wp';

export async function requestDpa(): Promise< void > {
	return wpcom.req.post( {
		path: '/me/request-dpa',
		apiVersion: '1.1',
	} );
}
