import { __, sprintf } from '@wordpress/i18n';
import { wpcom } from '../wpcom-fetcher';
import type { IpsTag } from './types';

export type DomainTransferRequest = {
	email: string;
	requested_at: string;
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
	const errorMessage = sprintf(
		/* translators: %s is the name of the list being fetched. */
		__( 'Failed to fetch %(list)s list. Please refresh the page and try again.' ),
		{ list: 'IPS tag' }
	);
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

export async function fetchDomainTransferRequest(
	domain: string,
	siteSlug: string
): Promise< DomainTransferRequest | null > {
	return wpcom.req.get( {
		path: `/sites/${ siteSlug }/domains/${ domain }/transfer-to-any-user`,
	} );
}

export async function updateDomainTransferRequest(
	domain: string,
	siteSlug: string,
	email: string
): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteSlug }/domains/${ domain }/transfer-to-any-user`,
		body: { email },
	} );
}

export async function deleteDomainTransferRequest(
	domain: string,
	siteSlug: string
): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteSlug }/domains/${ domain }/transfer-to-any-user/delete`,
	} );
}

export async function domainTransferToUser(
	domain: string,
	siteId: number,
	userId: string
): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/domains/${ domain }/transfer-to-user/${ userId }`,
	} );
}

export async function transferDomainToSite(
	domain: string,
	siteId: number,
	targetSiteId: number
): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/domains/${ domain }/transfer-to-site/${ targetSiteId }`,
	} );
}
