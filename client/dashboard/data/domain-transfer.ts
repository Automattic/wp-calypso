import { __ } from '@wordpress/i18n';
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
	/* translators: Please don't translate "IPS tag". */
	const errorMessage = __( 'Failed to fetch IPS tag list. Please refresh the page and try again.' );
	try {
		const response = await fetch( 'https://widgets.wp.com/domains/ips-tag-list.min.json' );
		if ( ! response.ok ) {
			throw new Error( errorMessage );
		}
		return await response.json();
	} catch ( error ) {
		throw new Error( errorMessage );
	}
}
