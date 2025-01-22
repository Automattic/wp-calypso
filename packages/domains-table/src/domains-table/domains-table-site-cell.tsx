import { SiteDetails } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
import {
	domainManagementTransferToOtherSiteLink,
	domainOnlySiteCreationLink,
} from '../utils/paths';
import type { MouseEvent } from 'react';

interface DomainsTableSiteCellProps {
	site: Pick< SiteDetails, 'ID' | 'name' >;
	siteSlug: string;
	domainName: string;
	userCanAddSiteToDomain: boolean;
	hasConnectableSites: boolean;
}

export const DomainsTableSiteCell = ( {
	site,
	siteSlug,
	domainName,
	userCanAddSiteToDomain,
	hasConnectableSites,
}: DomainsTableSiteCellProps ) => {
	const { __ } = useI18n();

	if ( userCanAddSiteToDomain ) {
		return (
			<a
				className="domains-table__add-site-link"
				href={
					hasConnectableSites
						? domainManagementTransferToOtherSiteLink( siteSlug, domainName )
						: domainOnlySiteCreationLink( siteSlug, site.ID )
				}
				onClick={ ( e: MouseEvent ) => e.stopPropagation() }
			>
				{ __( 'Add site' ) }
			</a>
		);
	}

	return site.name ?? '-';
};
