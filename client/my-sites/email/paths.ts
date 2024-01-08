import { stringify } from 'qs';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { isUnderDomainManagementAll, domainManagementRoot } from 'calypso/my-sites/domains/paths';

type QueryStringParameters = { [ key: string ]: string | undefined };

type EmailPathUtilityFunction = (
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	relativeTo?: string,
	urlParameters?: QueryStringParameters
) => string;

export const emailManagementPrefix = '/email';
export const emailManagementAllSitesPrefix = '/email/all';

export function isUnderEmailManagementAll( path?: string | null ) {
	return path?.startsWith( emailManagementAllSitesPrefix + '/' );
}

// Builds a URL query string from an object. Handles null values.
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

function getPath(
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	slug: string,
	relativeTo?: string | null,
	urlParameters?: QueryStringParameters
) {
	if ( siteName && domainName ) {
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

	if ( siteName ) {
		return '/email/' + siteName + buildQueryString( urlParameters );
	}

	return '/email';
}

// Retrieves the URL of the Add New Mailboxes page for email forwarding
export const getAddEmailForwardsPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'forwarding/add', relativeTo, urlParameters );

// Retrieves the URL of the Add New Mailboxes page either for G Suite or Google Workspace
export function getAddGSuiteUsersPath(
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	productType: typeof GOOGLE_WORKSPACE_PRODUCT_TYPE | typeof GSUITE_PRODUCT_TYPE,
	relativeTo?: string,
	source?: string
) {
	if ( domainName ) {
		return getPath( siteName, domainName, productType + '/add-users', relativeTo, {
			source,
		} );
	}

	return '/email/' + productType + '/add-users/' + siteName;
}

export const getManageTitanAccountPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/manage', relativeTo, urlParameters );

export const getManageTitanMailboxesPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/manage-mailboxes', relativeTo, urlParameters );

export const getNewTitanAccountPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/new', relativeTo, urlParameters );

// Retrieves the URL to set up Titan mailboxes
export const getTitanSetUpMailboxPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/set-up-mailbox', relativeTo, urlParameters );

export const getTitanSetUpThankYouPath = (
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	emailAddress?: string,
	relativeTo?: string
) =>
	getPath(
		siteName,
		domainName,
		'titan/set-up-mailbox/thank-you',
		relativeTo,
		emailAddress ? { email: emailAddress } : {}
	);

export const getTitanControlPanelRedirectPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/control-panel', relativeTo, urlParameters );

export const getEmailManagementPath = (
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	relativeTo?: string | null,
	urlParameters?: QueryStringParameters
) => getPath( siteName, domainName, 'manage', relativeTo, urlParameters );

export const getForwardingPath: EmailPathUtilityFunction = ( siteName, domainName, relativeTo ) =>
	getPath( siteName, domainName, 'forwarding', relativeTo );

// Retrieves the URL of the Email Comparison page
export const getPurchaseNewEmailAccountPath = (
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	relativeTo?: string,
	source?: string,
	emailProviderSlug?: string,
	intervalLength?: string
) =>
	getPath( siteName, domainName, 'purchase', relativeTo, {
		interval: intervalLength,
		provider: emailProviderSlug,
		source,
	} );

// Retrieves the URL of the Email In-Depth Comparison page
export const getEmailInDepthComparisonPath = (
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	relativeTo?: string,
	source?: string,
	intervalLength?: string
) =>
	getPath( siteName, domainName, 'compare', relativeTo, {
		interval: intervalLength,
		referrer: relativeTo,
		source,
	} );

export const getMailboxesPath = ( siteName?: string ) =>
	siteName ? `/mailboxes/${ siteName }` : `/mailboxes`;
