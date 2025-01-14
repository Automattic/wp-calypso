import { isEnabled } from '@automattic/calypso-config';
import { stringify } from 'qs';
import {
	isUnderDomainManagementAll,
	isUnderDomainSiteContext,
	domainManagementRoot,
	domainSiteContextRoot,
} from 'calypso/my-sites/domains/paths';

type QueryStringParameters = { [ key: string ]: string | undefined };

type EmailPathUtilityFunction = (
	siteName: string | null | undefined,
	domainName?: string | null,
	relativeTo?: string | null,
	urlParameters?: QueryStringParameters,
	inSiteContext?: boolean
) => string;

export const emailManagementPrefix = '/email';
export const emailManagementAllSitesPrefix = '/email/all';
export const domainsManagementPrefix = '/domains/manage/all/email';
export const emailSiteContextPrefix = `${ domainSiteContextRoot() }/email`;

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
	slug?: string | null,
	relativeTo?: string | null,
	urlParameters?: QueryStringParameters
) {
	if ( siteName && domainName ) {
		// Encodes only real domain names and not parameter placeholders
		if ( ! domainName.startsWith( ':' ) ) {
			// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
			// Note they are encoded twice since page.js decodes the path by default.
			domainName = encodeURIComponent( encodeURIComponent( domainName ) );
		}

		const slugFragment = slug ? '/' + slug : '';

		return (
			resolveRootPath( relativeTo ) +
			'/' +
			domainName +
			slugFragment +
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
) => {
	if ( isUnderDomainManagementAll( relativeTo ) ) {
		const prefix = isUnderDomainSiteContext( relativeTo )
			? emailSiteContextPrefix
			: domainsManagementPrefix;

		return `${ prefix }/${ domainName }/forwarding/add/${ siteName }${ buildQueryString(
			urlParameters
		) }`;
	}

	return getPath( siteName, domainName, 'forwarding/add', relativeTo, urlParameters );
};

// Retrieves the URL of the Add New Mailboxes page either for G Suite or Google Workspace
export function getAddGSuiteUsersPath(
	siteName: string | null | undefined,
	domainName: string | null | undefined,
	productType: string,
	relativeTo?: string,
	source?: string
) {
	if ( siteName && domainName ) {
		return getPath( siteName, domainName, productType + '/add-users', relativeTo, {
			source,
		} );
	}

	if ( siteName ) {
		return '/email/' + productType + '/add-users/' + siteName;
	}

	return '/email';
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
) => {
	if ( isUnderDomainManagementAll( relativeTo ) ) {
		return `${ domainsManagementPrefix }/${ domainName }/titan/new/${ siteName }${ buildQueryString(
			urlParameters
		) }`;
	}

	return getPath( siteName, domainName, 'titan/new', relativeTo, urlParameters );
};

// Retrieves the URL to set up Titan mailboxes
export const getTitanSetUpMailboxPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/set-up-mailbox', relativeTo, urlParameters );

export const getTitanControlPanelRedirectPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo,
	urlParameters
) => getPath( siteName, domainName, 'titan/control-panel', relativeTo, urlParameters );

// Generates URL: /email/:domain/manage/:site
export const getEmailManagementPath: EmailPathUtilityFunction = (
	siteName,
	domainName,
	relativeTo = null,
	urlParameters = {},
	inSiteContext = false
) => {
	if ( inSiteContext || isUnderDomainManagementAll( relativeTo ) ) {
		const prefix =
			inSiteContext || isUnderDomainSiteContext( relativeTo )
				? emailSiteContextPrefix
				: domainsManagementPrefix;

		return `${ prefix }/${ domainName }/${ siteName }${ buildQueryString( urlParameters ) }`;
	}

	return getPath( siteName, domainName, 'manage', relativeTo, urlParameters );
};

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
) => {
	if ( isEnabled( 'calypso/all-domain-management' ) && isUnderDomainManagementAll( relativeTo ) ) {
		return `${ domainsManagementPrefix }/${ domainName }/compare/${ siteName }${ buildQueryString( {
			interval: intervalLength,
			referrer: relativeTo,
			source,
		} ) }`;
	}

	return getPath( siteName, domainName, 'compare', relativeTo, {
		interval: intervalLength,
		referrer: relativeTo,
		source,
	} );
};

export const getProfessionalEmailCheckoutUpsellPath = (
	siteName: string,
	domainName: string,
	receiptId: number | string
) => `/checkout/offer-professional-email/${ domainName }/${ receiptId }/${ siteName }`;

export const getMailboxesPath = ( siteName?: string | null ) =>
	siteName ? `/mailboxes/${ siteName }` : `/mailboxes`;
