/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { isUnderDomainManagementAll, domainManagementRoot } from 'calypso/my-sites/domains/paths';

export const emailManagementPrefix = '/email';
export const emailManagementAllSitesPrefix = '/email/all';

function resolveRootPath( relativeTo ) {
	if ( relativeTo === emailManagementAllSitesPrefix || relativeTo === domainManagementRoot() ) {
		return emailManagementAllSitesPrefix;
	}
	if ( isUnderEmailManagementAll( relativeTo ) || isUnderDomainManagementAll( relativeTo ) ) {
		return emailManagementAllSitesPrefix;
	}
	return emailManagementPrefix;
}

export function emailManagementAddGSuiteUsers( siteName, domainName, relativeTo = null ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'gsuite/add-users', relativeTo );
	} else {
		path = '/email/gsuite/add-users/' + siteName;
	}

	return path;
}

export function emailManagementAddGSuiteUsersLegacy( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'add-gsuite-users' );
	} else {
		path = '/email/add-gsuite-users/' + siteName;
	}

	return path;
}

export function emailManagementNewGSuiteAccount(
	siteName,
	domainName,
	planType,
	relativeTo = null
) {
	return emailManagementEdit( siteName, domainName, 'gsuite/new/' + planType, relativeTo );
}

export function emailManagementManageTitanAccount(
	siteName,
	domainName,
	relativeTo = null,
	urlParameters = {}
) {
	return emailManagementEdit( siteName, domainName, 'titan/manage', relativeTo, urlParameters );
}

export function emailManagementNewTitanAccount( siteName, domainName, relativeTo = null ) {
	return emailManagementEdit( siteName, domainName, 'titan/new', relativeTo );
}

export function emailManagementTitanControlPanelRedirect(
	siteName,
	domainName,
	relativeTo = null,
	urlParameters = {}
) {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/control-panel',
		relativeTo,
		urlParameters
	);
}

export function emailManagement( siteName, domainName, relativeTo = null ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'manage', relativeTo );
	} else if ( siteName ) {
		path = '/email/' + siteName;
	} else {
		path = '/email';
	}

	return path;
}

export function emailManagementForwarding( siteName, domainName, relativeTo = null ) {
	return emailManagementEdit( siteName, domainName, 'forwarding', relativeTo );
}

export function emailManagementEdit(
	siteName,
	domainName,
	slug,
	relativeTo = null,
	urlParameters = {}
) {
	slug = slug || 'manage';

	// Encodes only real domain names and not parameter placeholders
	if ( domainName && ! String( domainName ).startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	const urlParameterString = urlParameters
		? stringify( urlParameters, { addQueryPrefix: true } )
		: '';

	return (
		resolveRootPath( relativeTo ) +
		'/' +
		domainName +
		'/' +
		slug +
		'/' +
		siteName +
		urlParameterString
	);
}

export function isUnderEmailManagementAll( path ) {
	return path?.startsWith( emailManagementAllSitesPrefix + '/' );
}
