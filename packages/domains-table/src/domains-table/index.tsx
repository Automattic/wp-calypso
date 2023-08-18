import { useI18n } from '@wordpress/react-i18n';
import { DomainsTableRow } from './domains-table-row';
import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
	isAllSitesView: boolean;

	// Detailed domain data is fetched on demand. The ability to customise fetching
	// is provided to allow for testing.
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
}

export function DomainsTable( { domains, fetchSiteDomains, isAllSitesView }: DomainsTableProps ) {
	const { __ } = useI18n();

	if ( ! domains ) {
		return null;
	}

	return (
		<table className="domains-table">
			<thead>
				<tr>
					<th>{ __( 'Domain', __i18n_text_domain__ ) }</th>
				</tr>
			</thead>
			<tbody>
				{ domains.map( ( domain ) => (
					<DomainsTableRow
						key={ domain.domain }
						domain={ domain }
						fetchSiteDomains={ fetchSiteDomains }
						isAllSitesView={ isAllSitesView }
					/>
				) ) }
			</tbody>
		</table>
	);
}
