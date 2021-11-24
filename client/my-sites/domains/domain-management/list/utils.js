import { type } from 'calypso/lib/domains/constants';
import {
	domainManagementEdit,
	domainManagementSiteRedirect,
	domainManagementTransferIn,
} from 'calypso/my-sites/domains/paths';

export const getDomainManagementPath = ( domainName, domainType, siteSlug, currentRoute ) => {
	switch ( domainType ) {
		case type.TRANSFER:
			return domainManagementTransferIn( siteSlug, domainName, currentRoute );

		case type.SITE_REDIRECT:
			return domainManagementSiteRedirect( siteSlug, domainName, currentRoute );

		default:
			return domainManagementEdit( siteSlug, domainName, currentRoute );
	}
};

export const ListAllActions = {
	editContactInfo: 'edit-contact-info',
	editContactEmail: 'edit-contact-email',
};

export const filterOutWpcomDomains = ( domains ) => {
	return domains.filter( ( domain ) => domain.type !== type.WPCOM );
};

export const getSimpleSortFunctionBy = ( column ) => ( first, second, sortOrder ) => {
	if ( ! first.hasOwnProperty( column ) || ! second.hasOwnProperty( column ) ) {
		return -1;
	}
	if ( first?.[ column ] === null && second?.[ column ] === null ) {
		return 0;
	}
	if ( first?.[ column ] === null ) {
		return -1 * sortOrder;
	}
	if ( second?.[ column ] === null ) {
		return 1 * sortOrder;
	}
	if ( first?.[ column ] > second?.[ column ] ) {
		return 1 * sortOrder;
	}
	if ( first?.[ column ] < second?.[ column ] ) {
		return -1 * sortOrder;
	}
	return 0;
};

export const getReverseSimpleSortFunctionBy = ( column ) => ( first, second, sortOrder ) =>
	getSimpleSortFunctionBy( column )( first, second, sortOrder ) * -1;
