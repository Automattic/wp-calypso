/** @format */

/**
 * External dependencies
 */
import { filter, startsWith } from 'lodash';

export function domainManagementRoot() {
	return '/domains/manage';
}

export function domainManagementList( siteName ) {
	return domainManagementRoot() + '/' + siteName;
}

export function domainManagementEdit( siteName, domainName, slug ) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! startsWith( domainName, ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return domainManagementRoot() + '/' + domainName + '/' + slug + '/' + siteName;
}

export function domainManagementAddGSuiteUsers( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = domainManagementEdit( siteName, domainName, 'add-gsuite-users' );
	} else {
		path = domainManagementRoot() + '/add-gsuite-users/' + siteName;
	}

	return path;
}

export function domainManagementContactsPrivacy( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'contacts-privacy' );
}

export function domainManagementEditContactInfo( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'edit-contact-info' );
}

export function domainManagementManageConsent( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'manage-consent' );
}

export function domainManagementEmail( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = domainManagementEdit( siteName, domainName, 'email' );
	} else if ( siteName ) {
		path = domainManagementRoot() + '/email/' + siteName;
	} else {
		path = domainManagementRoot() + '/email';
	}

	return path;
}

export function domainManagementEmailForwarding( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'email-forwarding' );
}

export function domainManagementNameServers( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'name-servers' );
}

export function domainManagementDns( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'dns' );
}

export function domainManagementRedirectSettings( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'redirect-settings' );
}

export function domainManagementPrimaryDomain( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'primary-domain' );
}

export function domainManagementTransfer( siteName, domainName, transferType = '' ) {
	return domainManagementEdit(
		siteName,
		domainName,
		filter( [ 'transfer', transferType ] ).join( '/' )
	);
}

export function domainManagementTransferIn( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'in' );
}

export function domainManagementTransferInPrecheck( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'precheck' );
}

export function domainManagementTransferOut( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'out' );
}

export function domainManagementTransferToAnotherUser( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'other-user' );
}

export function domainManagementTransferToOtherSite( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'other-site' );
}

export function domainMapping( siteName, domain = '' ) {
	let path = `/domains/add/mapping/${ siteName }`;
	if ( domain ) {
		path += `?initialQuery=${ domain }`;
	}

	return path;
}

export function domainTransferIn( siteName, domain ) {
	let path = `/domains/add/transfer/${ siteName }`;
	if ( domain ) {
		path += `?initialQuery=${ domain }`;
	}

	return path;
}

export function domainUseYourDomain( siteName, domain ) {
	let path = `/domains/add/use-your-domain/${ siteName }`;
	if ( domain ) {
		path += `?initialQuery=${ domain }`;
	}

	return path;
}

export function getSectionName( pathname ) {
	const regExp = new RegExp( '^' + domainManagementRoot() + '/[^/]+/([^/]+)', 'g' );
	const matches = regExp.exec( pathname );

	return matches ? matches[ 1 ] : null;
}

export function domainManagementDomainConnectMapping( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'domain-connect-mapping' );
}
