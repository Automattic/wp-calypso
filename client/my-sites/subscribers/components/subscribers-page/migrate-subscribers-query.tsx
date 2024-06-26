import wpcom from 'calypso/lib/wp';

type Response = {
	success: boolean;
	message: string;
};

type ResponseWithBody = {
	body: Response;
};

function migrateSubscribers( sourceSiteId: number, targetSiteId: number ): Promise< Response > {
	return wpcom.req
		.post(
			`/jetpack-blogs/${ encodeURIComponent( targetSiteId ) }/source/${ encodeURIComponent(
				sourceSiteId
			) }/migrate?http_envelope=1`
		)
		.then( ( data: ResponseWithBody & Response ) => {
			// In Calypso green the response has body
			return data.body ?? data;
		} );
}

export { migrateSubscribers };
