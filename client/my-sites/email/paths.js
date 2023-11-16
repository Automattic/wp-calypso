import { stringify } from 'qs';
import { isUnderDomainManagementAll, domainManagementRoot } from 'calypso/my-sites/domains/paths';

export const emailManagementPrefix = '/email';
export const emailManagementAllSitesPrefix = '/email/all';

/**
 * Builds a URL query string from an object. Handles null values.
 * @param {Object} parameters - optional path prefix
 * @returns {string} the corresponding query string
 */
const buildQueryString = ( parameters = {} ) =>
	parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

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
 * Retrieves the url of the Add New Mailboxes page for email forwarding:
 *
 * https://wordpress.com/email/:domainName/forwarding/add/:siteName
 * @param {string} siteSlug - slug of the current site
 * @param {string} domainName - domain name to add forwarding for
 * @param {string} relativeTo - optional path prefix
 * @param {string} source - optional source
 * @returns {string} the corresponding url
 */
export function emailManagementAddEmailForwards(
	siteSlug,
	domainName,
	relativeTo = null,
	source = null
) {
	return emailManagementEdit( siteSlug, domainName, 'forwarding/add', relativeTo, { source } );
}

/**
 * Retrieves the url of the Add New Mailboxes page either for G Suite or Google Workspace:
 *
 * https://wordpress.com/email/:domainName/google-workspace/add-users/:siteName
 * https://wordpress.com/email/:domainName/gsuite/add-users/:siteName
 * https://wordpress.com/email/google-workspace/add-users/:siteName
 * https://wordpress.com/email/gsuite/add-users/:siteName
 * @param {string} siteName - slug of the current site
 * @param {string} domainName - domain name of the account to add users to
 * @param {string} productType - type of account
 * @param {string} relativeTo - optional path prefix
 * @param {string} source - optional source
 * @returns {string} the corresponding url
 */
export function emailManagementAddGSuiteUsers(
	siteName,
	domainName,
	productType,
	relativeTo = null,
	source = null
) {
	if ( domainName ) {
		return emailManagementEdit( siteName, domainName, productType + '/add-users', relativeTo, {
			source,
		} );
	}

	return '/email/' + productType + '/add-users/' + siteName;
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

export function emailManagementNewTitanAccount(
	siteName,
	domainName,
	relativeTo = null,
	source = null
) {
	return emailManagementEdit( siteName, domainName, 'titan/new', relativeTo, { source } );
}

/**
 * Retrieves the url to set up Titan mailboxes
 *
 * https://wordpress.com/email/:domainName/forwarding/add/:siteName
 * @param {string} siteName - slug of the current site
 * @param {string} domainName - domain name to add forwarding for
 * @param {string | null} relativeTo - optional path prefix
 * @param {string | null} source - optional source
 * @returns {string} the corresponding url
 */
export function emailManagementTitanSetUpMailbox(
	siteName,
	domainName,
	relativeTo = null,
	source = null
) {
	return emailManagementEdit( siteName, domainName, 'titan/set-up-mailbox', relativeTo, {
		source,
	} );
}

/**
 * @param {string|undefined|null} siteName
 * @param {string|undefined|null} domainName
 * @param {string|null} emailAddress
 * @param {string|null} relativeTo
 * @returns {string}
 */
export function emailManagementTitanSetUpThankYou(
	siteName,
	domainName,
	emailAddress = null,
	relativeTo = null
) {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/set-up-mailbox/thank-you',
		relativeTo,
		emailAddress ? { email: emailAddress } : {}
	);
}

/**
 * @param {string|undefined|null} siteName
 * @param {string|undefined|null} domainName
 * @param {string|null} [relativeTo]
 * @param {Object.<string, string>} [urlParameters]
 */
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

/**
 * @param {string|undefined|null} siteName
 * @param {string|undefined|null} domainName
 * @param {string|null} [relativeTo]
 * @param {Object.<string, string>} [urlParameters]
 */
export function emailManagement( siteName, domainName, relativeTo = null, urlParameters = {} ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'manage', relativeTo, urlParameters );
	} else if ( siteName ) {
		path = '/email/' + siteName + buildQueryString( urlParameters );
	} else {
		path = '/email';
	}

	return path;
}

export function emailManagementForwarding( siteName, domainName, relativeTo = null ) {
	return emailManagementEdit( siteName, domainName, 'forwarding', relativeTo );
}

/**
 * Retrieves the url of the Email Comparison page:
 *
 * https://wordpress.com/email/:domainName/purchase/:siteName
 * @param {string} siteName - slug of the current site
 * @param {string} domainName - domain name of the account to add users to
 * @param {string|undefined|null} relativeTo - optional path prefix
 * @param {string|undefined|null} source - optional source
 * @param {string|undefined|null} emailProviderSlug - optional email provider slug whose form should be expanded on page load
 * @param {string|undefined|null} intervalLength - optional billing interval length (monthly or annually) to show on page load
 * @returns {string} the corresponding url
 */
export function emailManagementPurchaseNewEmailAccount(
	siteName,
	domainName,
	relativeTo = null,
	source = null,
	emailProviderSlug = null,
	intervalLength = null
) {
	return emailManagementEdit( siteName, domainName, 'purchase', relativeTo, {
		interval: intervalLength,
		provider: emailProviderSlug,
		source,
	} );
}

/**
 * Retrieves the url of the Email In-Depth Comparison page:
 *
 * https://wordpress.com/email/:domainName/in-depth-comparison/:siteName
 * @param {string} siteName - slug of the current site
 * @param {string} domainName - domain name of the account to add users to
 * @param {string|undefined|null} relativeTo - optional path prefix
 * @param {string|undefined|null} source - optional source
 * @param {string|undefined|null} intervalLength - optional billing interval length (monthly or annually)
 * @returns {string} the corresponding url
 */
export function emailManagementInDepthComparison(
	siteName,
	domainName,
	relativeTo = null,
	source = null,
	intervalLength = null
) {
	return emailManagementEdit( siteName, domainName, 'compare', relativeTo, {
		interval: intervalLength,
		referrer: relativeTo,
		source,
	} );
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

	return (
		resolveRootPath( relativeTo ) +
		'/' +
		domainName +
		'/' +
		slug +
		'/' +
		siteName +
		buildQueryString( urlParameters )
	);
}

/**
 * Retrieves the url of the Mailboxes page:
 *
 * https://wordpress.com/mailboxes/:siteName
 * @param {string|null|undefined} siteName - slug of the current site
 * @returns {string} the corresponding url
 */
export function emailManagementMailboxes( siteName = null ) {
	if ( siteName ) {
		return `/mailboxes/${ siteName }`;
	}
	return `/mailboxes`;
}

export function isUnderEmailManagementAll( path ) {
	return path?.startsWith( emailManagementAllSitesPrefix + '/' );
}
