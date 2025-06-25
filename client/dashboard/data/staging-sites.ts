import wpcom from 'calypso/lib/wp';

export async function deleteStagingSite( stagingSiteId: number, parentSiteId: number ) {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ parentSiteId }/staging-site/${ stagingSiteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
