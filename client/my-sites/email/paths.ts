import { stringify } from 'qs';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { isUnderDomainManagementAll, domainManagementRoot } from 'calypso/my-sites/domains/paths';

type QueryStringParameters = { [ key: string ]: string | undefined };

type EmailPathUtilityFunction = (
	siteName: string,
	domainName: string,
	relativeTo?: string,
	urlParameters?: QueryStringParameters
) => string;

export const emailManagementPrefix = '/email';
export const emailManagementAllSitesPrefix = '/email/all';

/**
 * Builds a URL query string from an object. Handles null values.
 * @param {Object} parameters - optional path prefix
 * @returns {string} the corresponding query string
 */
const buildQueryString = ( parameters?: QueryStringParameters ) =>
	parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

function resolveRootPath( relativeTo?: string | null ) {
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
 * https://wordpress.com/email/:domainName/forwarding/add/:siteName
 */
export const emailManagementAddEmailForwards: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit( siteName, domainName, 'forwarding/add', relativeTo, urlParameters );
};

/**
 * Retrieves the url of the Add New Mailboxes page either for G Suite or Google Workspace:
 * https://wordpress.com/email/:domainName/google-workspace/add-users/:siteName
 * https://wordpress.com/email/:domainName/gsuite/add-users/:siteName
 * https://wordpress.com/email/google-workspace/add-users/:siteName
 * https://wordpress.com/email/gsuite/add-users/:siteName
 */
export function emailManagementAddGSuiteUsers(
	siteName: string,
	domainName: string,
	productType: typeof GOOGLE_WORKSPACE_PRODUCT_TYPE | typeof GSUITE_PRODUCT_TYPE,
	relativeTo?: string,
	source?: string
) {
	if ( domainName ) {
		return emailManagementEdit( siteName, domainName, productType + '/add-users', relativeTo, {
			source,
		} );
	}

	return '/email/' + productType + '/add-users/' + siteName;
}

export const emailManagementManageTitanAccount: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit( siteName, domainName, 'titan/manage', relativeTo, urlParameters );
};

export const emailManagementManageTitanMailboxes: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/manage-mailboxes',
		relativeTo,
		urlParameters
	);
};

export const emailManagementNewTitanAccount: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit( siteName, domainName, 'titan/new', relativeTo, urlParameters );
};

/**
 * Retrieves the url to set up Titan mailboxes
 * https://wordpress.com/email/:domainName/forwarding/add/:siteName
 */
export const emailManagementTitanSetUpMailbox: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/set-up-mailbox',
		relativeTo,
		urlParameters
	);
};

export function emailManagementTitanSetUpThankYou(
	siteName: string,
	domainName: string,
	emailAddress?: string,
	relativeTo?: string
) {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/set-up-mailbox/thank-you',
		relativeTo,
		emailAddress ? { email: emailAddress } : {}
	);
}

export const emailManagementTitanControlPanelRedirect: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => {
	return emailManagementEdit(
		siteName,
		domainName,
		'titan/control-panel',
		relativeTo,
		urlParameters
	);
};

export const emailManagement = (
	siteName?: string | null,
	domainName?: string | null,
	relativeTo?: string | null,
	urlParameters?: QueryStringParameters
) => {
	let path;

	if ( siteName && domainName ) {
		path = emailManagementEdit( siteName, domainName, 'manage', relativeTo, urlParameters );
	} else if ( siteName ) {
		path = '/email/' + siteName + buildQueryString( urlParameters );
	} else {
		path = '/email';
	}

	return path;
};

export function emailManagementForwarding(
	siteName: string,
	domainName: string,
	relativeTo?: string
) {
	return emailManagementEdit( siteName, domainName, 'forwarding', relativeTo );
}

/**
 * Retrieves the url of the Email Comparison page:
 * https://wordpress.com/email/:domainName/purchase/:siteName
 */
export function emailManagementPurchaseNewEmailAccount(
	siteName: string,
	domainName: string,
	relativeTo?: string,
	source?: string,
	emailProviderSlug?: string,
	intervalLength?: string
) {
	return emailManagementEdit( siteName, domainName, 'purchase', relativeTo, {
		interval: intervalLength,
		provider: emailProviderSlug,
		source,
	} );
}

/**
 * Retrieves the url of the Email In-Depth Comparison page:
 * https://wordpress.com/email/:domainName/in-depth-comparison/:siteName
 */
export function emailManagementInDepthComparison(
	siteName: string,
	domainName: string,
	relativeTo?: string,
	source?: string,
	intervalLength?: string
) {
	return emailManagementEdit( siteName, domainName, 'compare', relativeTo, {
		interval: intervalLength,
		referrer: relativeTo,
		source,
	} );
}

export function emailManagementEdit(
	siteName: string,
	domainName: string,
	slug?: string | null,
	relativeTo?: string | null,
	urlParameters: { [ key: string ]: string | undefined } = {}
) {
	slug = slug || 'manage';

	// Encodes only real domain names and not parameter placeholders
	if ( domainName.startsWith( ':' ) ) {
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

export function emailManagementMailboxes( siteName?: string ) {
	if ( siteName ) {
		return `/mailboxes/${ siteName }`;
	}
	return `/mailboxes`;
}

export function isUnderEmailManagementAll( path?: string | null ) {
	return path?.startsWith( emailManagementAllSitesPrefix + '/' );
}
