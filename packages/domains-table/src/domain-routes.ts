import { addQueryArgs } from '@wordpress/url';
import type { PartialDomainData } from '@automattic/data-stores';

export function domainManagementLink(
	{ domain, type }: PartialDomainData,
	siteSlug: string,
	isAllSitesView: boolean
) {
	const viewSlug = domainManagementViewSlug( type );

	// Encodes only real domain names and not parameter placeholders
	if ( ! domain.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domain = encodeURIComponent( encodeURIComponent( domain ) );
	}

	if ( isAllSitesView ) {
		return `/domains/manage/all/${ domain }/${ viewSlug }/${ siteSlug }`;
	}

	return `/domains/manage/${ domain }/${ viewSlug }/${ siteSlug }`;
}

export function domainManagementTransferToOtherSiteLink( siteSlug: string, domainName: string ) {
	return `/domains/manage/all/${ domainName }/transfer/other-site/${ siteSlug }`;
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

export function domainOnlySiteCreationLink( siteSlug: string, siteId: number ) {
	return addQueryArgs( '/start/site-selected/', { siteSlug, siteId } );
}
