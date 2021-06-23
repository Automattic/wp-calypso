/**
 * Internal dependencies
 */
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

export const isEmpty = ( value ) => {
	return Object.keys( value ?? {} ).length === 0;
};

export const debounce = ( func, delay, { leading } = {} ) => {
	let timerId;

	return ( ...args ) => {
		if ( ! timerId && leading ) {
			func( ...args );
		}
		clearTimeout( timerId );

		timerId = setTimeout( () => func( ...args ), delay );
	};
};
