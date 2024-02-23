import wpcom from 'calypso/lib/wp';

type Response = {
	success: boolean;
	message: string;
};
function migrateSubscribers( sourceSiteId: number, targetSiteId: number ): Promise< Response > {
	return wpcom.req.post(
		`/jetpack-blogs/${ encodeURIComponent( targetSiteId ) }/source/${ encodeURIComponent(
			sourceSiteId
		) }/migrate?http_envelope=1`
	);
}

export { migrateSubscribers };
