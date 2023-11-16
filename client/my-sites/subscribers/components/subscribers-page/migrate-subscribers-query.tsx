import wpcomRequest from 'wpcom-proxy-request';

type Response = {
	success: boolean;
	message: string;
};
function migrateSubscribers( sourceSiteId: number, targetSiteId: number ) {
	return wpcomRequest< Response >( {
		// This endpoint is pretty old and needs the old variant of the envelope param.
		path: `/jetpack-blogs/${ encodeURIComponent( targetSiteId ) }/source/${ encodeURIComponent(
			sourceSiteId
		) }/migrate?http_envelope=1`,
		apiNamespace: 'rest/v1',
		method: 'POST',
	} );
}

export { migrateSubscribers };
