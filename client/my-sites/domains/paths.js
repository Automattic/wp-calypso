import { filter } from 'lodash';
import { stringify } from 'qs';
import { addQueryArgs } from 'calypso/lib/url';
import { isUnderEmailManagementAll } from 'calypso/my-sites/email/paths';

function resolveRootPath( relativeTo = null ) {
	if ( relativeTo ) {
		if ( relativeTo === domainManagementRoot() ) {
			return domainManagementAllRoot();
		}

		if ( isUnderDomainManagementAll( relativeTo ) || isUnderEmailManagementAll( relativeTo ) ) {
			return domainManagementAllRoot();
		}
	}

	return domainManagementRoot();
}

function domainManagementEditBase(
	siteName,
	domainName,
	slug,
	relativeTo = null,
	queryArgs = null
) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! domainName.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	const baseUrl = resolveRootPath( relativeTo ) + '/' + domainName + '/' + slug + '/' + siteName;

	if ( queryArgs ) {
		return addQueryArgs( queryArgs, baseUrl );
	}

	return baseUrl;
}

function domainManagementTransferBase(
	siteName,
	domainName,
	transferType = '',
	relativeTo = null
) {
	return domainManagementEditBase(
		siteName,
		domainName,
		filter( [ 'transfer', transferType ] ).join( '/' ),
		relativeTo
	);
}

export function isUnderDomainManagementAll( path ) {
	return path?.startsWith( domainManagementAllRoot() + '/' ) || path === domainManagementRoot();
}

export function isUnderDomainManagementOverview( path ) {
	return path?.startsWith( domainManagementOverviewRoot() + '/' );
}

export function domainAddNew( siteName, searchTerm ) {
	let path = `/domains/add`;

	if ( siteName ) {
		path = `${ path }/${ siteName }`;
	}

	if ( searchTerm ) {
		return `${ path }?suggestion=${ searchTerm }`;
	}

	return path;
}

export function domainAddEmailUpsell( siteName, domainName ) {
	return `/domains/add/${ domainName }/email/${ siteName }`;
}

export function domainManagementAllRoot() {
	return '/domains/manage/all';
}

export function domainManagementOverviewRoot() {
	return domainManagementAllRoot() + '/overview';
}

export function domainManagementEmailRoot() {
	return domainManagementAllRoot() + '/email';
}

export function domainManagementRoot() {
	return '/domains/manage';
}

/**
 * @param {string|undefined} siteName
 * @param {string|undefined} relativeTo
 * @param {boolean|undefined} isDomainOnlySite
 */
export function domainManagementList( siteName, relativeTo = null, isDomainOnlySite = false ) {
	if (
		isDomainOnlySite ||
		isUnderDomainManagementAll( relativeTo ) ||
		isUnderEmailManagementAll( relativeTo )
	) {
		return domainManagementRoot();
	}
	return domainManagementRoot() + '/' + siteName ?? '';
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 * @param {Object | null} expandSections Which accordion to expand automattically, e.g. { 'nameservers': true }
 */
export function domainManagementEdit(
	siteName,
	domainName,
	relativeTo = null,
	expandSections = null
) {
	return domainManagementEditBase( siteName, domainName, 'edit', relativeTo, expandSections );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementEditContactInfo( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'edit-contact-info', relativeTo );
}

export function domainManagementAllEditContactInfo() {
	return domainManagementAllRoot() + '/edit-contact-info';
}

export function domainManagementAllEditSelectedContactInfo() {
	return domainManagementAllRoot() + '/edit-selected-contact-info';
}

/**
 * @param {string} siteName
 */
export function domainManagementEditSelectedContactInfo( siteName ) {
	return domainManagementRoot() + '/edit-selected-contact-info/' + siteName;
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementManageConsent( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'manage-consent', relativeTo );
}

export function domainManagementEmail( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = domainManagementEditBase( siteName, domainName, 'email' );
	} else if ( siteName ) {
		path = domainManagementRoot() + '/email/' + siteName;
	} else {
		path = domainManagementRoot() + '/email';
	}

	return path;
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementDns( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'dns', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementDnsAddRecord( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'add-dns-record', relativeTo );
}

export function domainManagementDnsEditRecord(
	siteName,
	domainName,
	relativeTo = null,
	recordId = null
) {
	let path = domainManagementEditBase( siteName, domainName, 'edit-dns-record', relativeTo );
	if ( recordId ) {
		path += '?recordId=' + encodeURI( recordId );
	}
	return path;
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementRedirectSettings( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'redirect-settings', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementSecurity( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'security', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementSiteRedirect( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'redirect', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransfer( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, '', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferIn( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'in', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferInPrecheck( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'precheck', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferOut( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'out', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferToAnotherUser( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'other-user', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferToAnyUser( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'any-user', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementTransferToOtherSite( siteName, domainName, relativeTo = null ) {
	return domainManagementTransferBase( siteName, domainName, 'other-site', relativeTo );
}

export function domainMapping( siteName, domain = '' ) {
	let path = `/domains/add/mapping/${ siteName }`;
	if ( domain ) {
		path += `?initialQuery=${ domain }`;
	}

	return path;
}

/**
 *
 * @param { string } siteName	The slug for the site.
 * @param { string } domainName	The domain name to map.
 * @param { string } step		The step slug to start from (optional)
 * @param { boolean } showErrors Whether to show the mapping setup errors (optional).
 * @param { boolean } firstVisit Whether this is the first time the user is going through the setup (optional).
 * @returns {string} Path to the mapping setup flow.
 */
export function domainMappingSetup(
	siteName,
	domainName,
	step = '',
	showErrors = false,
	firstVisit = false
) {
	let path = `/domains/mapping/${ siteName }/setup/${ domainName }`;
	const params = {};

	if ( step ) {
		params.step = step;
	}

	if ( showErrors ) {
		params[ 'show-errors' ] = true;
	}

	if ( firstVisit ) {
		params.firstVisit = true;
	}

	const queryString = stringify( params );
	if ( queryString ) {
		path += '?' + queryString;
	}

	return path;
}

/**
 * Return the path to start an inbound domain transfer to WordPress.com.
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

/**
 * @typedef {Object} QueryArgs - query args for the domainUseMyDomain function.
 * @property {string} [domain] - the domain name to search.
 * @property {string} [initialMode] - useMyDomainInputMode.
 * @property {string} [redirectTo] - the page to redirect on pressing back.
 */

/**
 * @param {string} siteName - The slug for the site.
 * @param {QueryArgs} [options] - The query args for the function.
 * @returns {string} The resulting URL for the use my domain page.
 */
export function domainUseMyDomain( siteName, { domain, initialMode, redirectTo } = {} ) {
	const path = `/domains/add/use-my-domain/${ siteName }`;
	const queryArgs = [];
	if ( domain ) {
		queryArgs.push( `initialQuery=${ domain }` );

		if ( initialMode ) {
			queryArgs.push( `initialMode=${ initialMode }` );
		}
	}
	if ( redirectTo ) {
		queryArgs.push( `redirect_to=${ redirectTo }` );
	}

	return path + ( queryArgs.length ? `?${ queryArgs.join( '&' ) }` : '' );
}

export function getSectionName( pathname ) {
	const regExp = new RegExp( '^' + domainManagementRoot() + '/[^/]+/([^/]+)', 'g' );
	const matches = regExp.exec( pathname );

	return matches ? matches[ 1 ] : null;
}

export function domainManagementDomainConnectMapping( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'domain-connect-mapping', relativeTo );
}

export function createSiteFromDomainOnly( siteSlug, siteId ) {
	return `/start/site-selected/?siteSlug=${ encodeURIComponent(
		siteSlug
	) }&siteId=${ encodeURIComponent( siteId ) }`;
}
