import wpcom from 'calypso/lib/wp';

export interface SiteScan {
	most_recent: {
		timestamp: string;
	};
	reason: string;
	state: 'unavailable' | 'idle';
	threats: Record< string, unknown >[];
}

export async function fetchSiteScan( siteId: number ): Promise< SiteScan > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/scan`,
		apiNamespace: 'wpcom/v2',
	} );
}
