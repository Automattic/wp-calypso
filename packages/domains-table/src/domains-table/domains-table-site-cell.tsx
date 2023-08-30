import { SiteDetails } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';

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
		return <a href={ domainOnlySiteCreationLink( siteSlug, site.ID ) }>{ __( 'Add site' ) }</a>;
	}

	return site.name ?? '-';
};

export function domainOnlySiteCreationLink( siteSlug: string, siteId: number ) {
	return `/start/site-selected/?siteSlug=${ encodeURIComponent(
		siteSlug
	) }&siteId=${ encodeURIComponent( siteId ) }`;
}

export function domainManagementTransferToOtherSiteLink( siteSlug: string, domainName: string ) {
	return `/domains/manage/all/${ domainName }/transfer/other-site/${ siteSlug }`;
}
