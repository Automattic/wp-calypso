import wpcom from 'calypso/lib/wp';

export async function updateDomainLock( domain: string, enabled: boolean ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/transfer`,
		apiNamespace: 'wpcom/v2',
		body: {
			domainStatus: JSON.stringify( {
				command: enabled ? 'lock' : 'unlock',
			} ),
		},
	} );
}

export async function requestTransferCode( domain: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/transfer`,
		apiNamespace: 'wpcom/v2',
		body: {
			domainStatus: JSON.stringify( {
				command: 'only-send-code',
			} ),
		},
	} );
}

export type IpsTag = {
	tag: string;
	description: string;
	registrarName: string;
};

export async function getIpsTagList(): Promise< IpsTag[] > {
	return fetch( 'https://widgets.wp.com/domains/ips-tag-list.min.json' ).then( ( res ) =>
		res.json()
	);
}
