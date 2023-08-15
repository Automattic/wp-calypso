import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';

interface DomainsTableRowProps {
	domain: PartialDomainData;
}

export function DomainsTableRow( { domain }: DomainsTableRowProps ) {
	return (
		<tr key={ domain.domain }>
			<td>
				<a className="domains-table__domain-link" href={ getDomainManagementLink( domain ) }>
					{ domain.domain }
				</a>
			</td>
		</tr>
	);
}

function getDomainManagementLink( { blog_id, domain }: PartialDomainData ) {
	return `/domains/manage/all/${ domain }/edit/${ blog_id }`;
}
