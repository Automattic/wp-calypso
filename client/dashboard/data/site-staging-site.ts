import wpcom from 'calypso/lib/wp';

export async function deleteStagingSite( stagingSiteId: number, productionSiteId: number ) {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ productionSiteId }/staging-site/${ stagingSiteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function getAutomatedTransferStatus( siteId: number ) {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/status`,
		apiVersion: '1',
	} );
}
