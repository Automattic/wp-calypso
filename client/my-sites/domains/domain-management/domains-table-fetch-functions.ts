import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import type {
	AllDomainsQueryArgs,
	AllDomainsQueryFnData,
	BulkDomainUpdateStatusQueryFnData,
	BulkUpdateVariables,
	SiteDetails,
	SiteDomainsQueryFnData,
} from '@automattic/data-stores';

export async function fetchAllDomains(
	queryArgs: AllDomainsQueryArgs = {}
): Promise< AllDomainsQueryFnData > {
	return wp.req.get( {
		path: addQueryArgs( '/all-domains', queryArgs ),
		apiVersion: '1.1',
	} );
}

export async function fetchSite(
	sourceSiteSlug: number | string | null | undefined
): Promise< SiteDetails > {
	return wp.req.get( {
		path: '/sites/' + encodeURIComponent( sourceSiteSlug ?? '' ),
	} );
}

export async function fetchSiteDomains(
	siteIdOrSlug: number | string | null | undefined
): Promise< SiteDomainsQueryFnData > {
	return wp.req.get( `/sites/${ siteIdOrSlug }/domains`, { apiVersion: '1.2' } );
}

export async function createBulkAction( variables: BulkUpdateVariables ): Promise< void > {
	switch ( variables.type ) {
		case 'set-auto-renew':
			return wp.req.post( {
				path: `/domains/bulk-actions/${ variables.type }`,
				apiNamespace: 'wpcom/v2',
				body: {
					domains: variables.domains,
					auto_renew: variables.autoRenew,
				},
			} );

		case 'update-contact-info':
			return wp.req.post( {
				path: `/domains/bulk-actions/${ variables.type }`,
				apiNamespace: 'wpcom/v2',
				body: {
					domains: variables.domains,
					transfer_lock: variables.transferLock,
					whois: variables.whois,
				},
			} );
	}
}

export async function fetchBulkActionStatus(): Promise< BulkDomainUpdateStatusQueryFnData > {
	return wp.req.get( {
		path: '/domains/bulk-actions',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteBulkActionStatus(): Promise< void > {
	return wp.req.post( {
		path: '/domains/bulk-actions',
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
