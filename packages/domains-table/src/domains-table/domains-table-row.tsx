import { useSiteDomainsQuery } from '@automattic/data-stores';
import { useMemo } from 'react';
import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';

interface DomainsTableRowProps {
	domain: PartialDomainData;

	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
}

export function DomainsTableRow( { domain, fetchSiteDomains }: DomainsTableRowProps ) {
	const { data } = useSiteDomainsQuery(
		domain.blog_id,
		fetchSiteDomains && {
			queryFn: () => fetchSiteDomains( domain.blog_id ),
		}
	);

	const { siteSlug } = useMemo( () => {
		const primaryDomain = data?.domains?.find( ( d ) => d.primary_domain );
		const unmappedDomain = data?.domains?.find( ( d ) => d.wpcom_domain );
		const siteSlug =
			primaryDomain?.type === 'redirect' ? unmappedDomain?.domain : primaryDomain?.domain;

		return {
			// Fall back to the site's ID if we're still loading detailed domain data
			siteSlug: siteSlug || domain.blog_id.toString( 10 ),
		};
	}, [ data, domain.blog_id ] );

	return (
		<tr key={ domain.domain }>
			<td>
				<a className="domains-table__domain-link" href={ domainManagementLink( domain, siteSlug ) }>
					{ domain.domain }
				</a>
			</td>
		</tr>
	);
}

function domainManagementLink( { domain, type }: PartialDomainData, siteSlug: string ) {
	const viewSlug = domainManagementViewSlug( type );

	// Encodes only real domain names and not parameter placeholders
	if ( ! domain.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domain = encodeURIComponent( encodeURIComponent( domain ) );
	}

	return `/domains/manage/all/${ domain }/${ viewSlug }/${ siteSlug }`;
}

function domainManagementViewSlug( type: PartialDomainData[ 'type' ] ) {
	switch ( type ) {
		case 'transfer':
			return 'transfer/in';
		case 'redirect':
			return 'redirect';
		default:
			return 'edit';
	}
}
