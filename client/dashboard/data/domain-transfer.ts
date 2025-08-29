import wpcom from 'calypso/lib/wp';

export type IpsTag = {
	tag: string;
	registrarName: string;
	registrarUrl: string;
};

export async function updateDomainLock( domain: string, enabled: boolean ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/transfer`,
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
		body: {
			domainStatus: JSON.stringify( {
				command: 'only-send-code',
			} ),
		},
	} );
}

export async function saveIpsTag( domain: string, ipsTag: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/transfer`,
		body: {
			domainStatus: JSON.stringify( {
				command: 'set-ips-tag',
				payload: { ips_tag: ipsTag },
			} ),
		},
	} );
}

export async function fetchIpsTagList(): Promise< IpsTag[] > {
	try {
		const response = await fetch( 'https://widgets.wp.com/domains/ips-tag-list.min.json' );
		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}
		return await response.json();
	} catch ( error ) {
		throw new Error( 'Failed to fetch IPS tag list' );
	}
}
