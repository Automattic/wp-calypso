import { wpcom } from '../wpcom-fetcher';

export async function createStagingSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/staging-site`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteStagingSite( stagingSiteId: number, productionSiteId: number ) {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ productionSiteId }/staging-site/${ stagingSiteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
