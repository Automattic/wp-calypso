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

/**
 * Retrieves the url of the Add New Users page either for G Suite or Google Workspace:
 *
 * https://wordpress.com/email/:domainName/google-workspace/add-users/:siteName
 * https://wordpress.com/email/:domainName/gsuite/add-users/:siteName
 * https://wordpress.com/email/google-workspace/add-users/:siteName
 * https://wordpress.com/email/gsuite/add-users/:siteName
 *
 * @param {string} siteName - slug of the current site
 * @param {string} domainName - domain name of the account to add users to
 * @param {string} productType - type of account
 * @param {string} relativeTo - optional path prefix
 * @returns {string} the corresponding url
 */
export function emailManagementAddGSuiteUsers(
	siteName,
	domainName,
	productType,
	relativeTo = null
) {
	if ( domainName ) {
		return emailManagementEdit( siteName, domainName, productType + '/add-users', relativeTo );
	}

	return '/email/' + productType + '/add-users/' + siteName;
}

export function emailManagementNewGSuiteAccount(
	siteName,
	domainName,
	productType,
	relativeTo = null
) {
	return emailManagementEdit( siteName, domainName, productType + '/new', relativeTo );
}

export function emailManagementManageTitanAccount(
	siteName,
	domainName,
	relativeTo = null,
	urlParameters = {}
) {
	return emailManagementEdit( siteName, domainName, 'titan/manage', relativeTo, urlParameters );
}

export function emailManagementManageTitanMailboxes(
	siteName,
	domainName,
	relativeTo = null,
	urlParameters = {}
) {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/manage-mailboxes',
		relativeTo,
		urlParameters
	);
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
