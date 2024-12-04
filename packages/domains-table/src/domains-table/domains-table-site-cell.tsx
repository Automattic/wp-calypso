import { SiteDetails } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
import { domainOnlySiteCreationLink } from '../utils/paths';
import type { MouseEvent } from 'react';

interface DomainsTableSiteCellProps {
	site: Pick< SiteDetails, 'ID' | 'name' >;
	userCanAddSiteToDomain: boolean;
	siteSlug: string;
}

export const DomainsTableSiteCell = ( {
	site,
	userCanAddSiteToDomain,
	siteSlug,
}: DomainsTableSiteCellProps ) => {
	const { __ } = useI18n();

	if ( userCanAddSiteToDomain ) {
		return (
			<a
				className="domains-table__add-site-link"
				href={ domainOnlySiteCreationLink( siteSlug, site.ID ) }
				onClick={ ( e: MouseEvent ) => e.stopPropagation() }
			>
				{ __( 'Add site' ) }
			</a>
		);
	}

	return site.name ?? '-';
};
