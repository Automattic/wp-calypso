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

	const { primaryDomain } = useMemo(
		() => ( {
			primaryDomain: data?.domains?.find( ( d ) => d.primary_domain )?.domain,
		} ),
		[ data ]
	);

	return (
		<tr key={ domain.domain }>
			<td>
				<a
					className="domains-table__domain-link"
					href={ getDomainManagementLink( domain, primaryDomain ) }
				>
					{ domain.domain }
				</a>
			</td>
		</tr>
	);
}

function getDomainManagementLink(
	{ blog_id, domain }: PartialDomainData,
	sitePrimaryDomain: string | undefined
) {
	return `/domains/manage/all/${ domain }/edit/${ sitePrimaryDomain ?? blog_id }`;
}
