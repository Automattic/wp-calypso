/**
 * External dependencies
 */
import { filter, startsWith } from 'lodash';
import { stringify } from 'qs';

function resolveRootPath( relativeTo = null ) {
	if ( relativeTo && relativeTo.startsWith( domainManagementUserRoot() ) ) {
		return domainManagementUserRoot();
	}
	return domainManagementRoot();
}

export function domainAddNew( siteName, searchTerm ) {
	const path = `/domains/add/${ siteName }`;

	if ( searchTerm ) {
		return `${ path }?suggestion=${ searchTerm }`;
	}

	return path;
}

export function domainManagementUserRoot() {
	return '/me/domains';
}

export function domainManagementRoot() {
	return '/domains/manage';
}

export function domainManagementList( siteName, relativeTo = null ) {
	if ( relativeTo && relativeTo.startsWith( domainManagementUserRoot() ) ) {
		return domainManagementUserRoot() + '/';
	}
	return domainManagementRoot() + '/' + siteName;
}

export function domainManagementEdit( siteName, domainName, slug, relativeTo = null ) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! startsWith( domainName, ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return resolveRootPath( relativeTo ) + '/' + domainName + '/' + slug + '/' + siteName;
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

export function domainManagementContactsPrivacy( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'contacts-privacy', relativeTo );
}

export function domainManagementEditContactInfo( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'edit-contact-info', relativeTo );
}

export function domainManagementManageConsent( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'manage-consent', relativeTo );
}

export function domainManagementEmail( siteName, domainName, relativeTo = null ) {
	let path;

	if ( domainName ) {
		path = domainManagementEdit( siteName, domainName, 'email', relativeTo );
	} else if ( siteName ) {
		path = domainManagementRoot() + '/email/' + siteName;
	} else {
		path = domainManagementRoot() + '/email';
	}

	return path;
}

export function domainManagementEmailForwarding( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'email-forwarding', relativeTo );
}

export function domainManagementChangeSiteAddress( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'change-site-address', relativeTo );
}

export function domainManagementNameServers( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'name-servers', relativeTo );
}

export function domainManagementDns( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'dns', relativeTo );
}

export function domainManagementRedirectSettings( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'redirect-settings', relativeTo );
}

export function domainManagementSecurity( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'security', relativeTo );
}

export function domainManagementPrimaryDomain( siteName, domainName, relativeTo = null ) {
	return domainManagementEdit( siteName, domainName, 'primary-domain', relativeTo );
}

export function domainManagementTransfer(
	siteName,
	domainName,
	transferType = '',
	relativeTo = null
) {
	return domainManagementEdit(
		siteName,
		domainName,
		filter( [ 'transfer', transferType ] ).join( '/' ),
		relativeTo
	);
}

export function domainManagementTransferIn( siteName, domainName, relativeTo = null ) {
	return domainManagementTransfer( siteName, domainName, 'in', relativeTo );
}

export function domainManagementTransferInPrecheck( siteName, domainName, relativeTo = null ) {
	return domainManagementTransfer( siteName, domainName, 'precheck', relativeTo );
}

export function domainManagementTransferOut( siteName, domainName, relativeTo = null ) {
	return domainManagementTransfer( siteName, domainName, 'out', relativeTo );
}

export function domainManagementTransferToAnotherUser( siteName, domainName, relativeTo = null ) {
	return domainManagementTransfer( siteName, domainName, 'other-user', relativeTo );
}

export function domainManagementTransferToOtherSite( siteName, domainName, relativeTo = null ) {
	return domainManagementTransfer( siteName, domainName, 'other-site', relativeTo );
}

export function domainMapping( siteName, domain = '' ) {
	let path = `/domains/add/mapping/${ siteName }`;
	if ( domain ) {
		path += `?initialQuery=${ domain }`;
	}

	return path;
}

/**
 * Return the path to start an inbound domain transfer to WordPress.com.
 *
 * @param { string } siteName         The slug for the site.
 * @param { string } domain           The domain name.
 * @param { boolean } useStandardBack Flag to indicate whether the "Back" button in the
 *                                      transfer page should return to the current URL context.
 * @returns { string } Path to the inbound domain transfer UI.
 */
export function domainTransferIn( siteName, domain, useStandardBack ) {
	let path = `/domains/add/transfer/${ siteName }`;
	const params = {};

	if ( domain ) {
		params.initialQuery = domain;
	}

	if ( useStandardBack ) {
		params.useStandardBack = true;
	}

	const queryString = stringify( params );
	if ( queryString ) {
		path += '?' + queryString;
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
