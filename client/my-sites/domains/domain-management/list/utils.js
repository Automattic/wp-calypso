import { translate } from 'i18n-calypso';
import { type } from 'calypso/lib/domains/constants';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import {
	domainManagementEdit,
	domainManagementSiteRedirect,
	domainManagementTransferIn,
} from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

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

export const showUpdatePrimaryDomainSuccessNotice = ( domainName ) => {
	reduxDispatch(
		successNotice(
			translate(
				'Primary domain changed: all domains will redirect to {{em}}%(domainName)s{{/em}}.',
				{ args: { domainName }, components: { em: <em /> } }
			),
			{ duration: 10000, isPersistent: true }
		)
	);
};

export const showUpdatePrimaryDomainErrorNotice = ( errorMessage ) => {
	reduxDispatch(
		errorNotice(
			errorMessage ||
				translate( "Something went wrong and we couldn't change your primary domain." ),
			{ duration: 10000, isPersistent: true }
		)
	);
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

export const filterDomainsByOwner = ( domains, filter ) => {
	return domains.filter( ( domain ) => {
		if ( 'owned-by-me' === filter ) {
			return domain.currentUserIsOwner;
		} else if ( 'owned-by-others' === filter ) {
			return ! domain.currentUserIsOwner;
		}
		return true;
	} );
};
