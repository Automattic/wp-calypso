import { filter } from 'lodash';
import { stringify } from 'qs';
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

function domainManagementEditBase( siteName, domainName, slug, relativeTo = null ) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! domainName.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return resolveRootPath( relativeTo ) + '/' + domainName + '/' + slug + '/' + siteName;
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

export function domainManagementRoot() {
	return '/domains/manage';
}

/**
 * @param {string?} siteName
 * @param {string?} relativeTo
 */
export function domainManagementList( siteName, relativeTo = null ) {
	if ( isUnderDomainManagementAll( relativeTo ) || isUnderEmailManagementAll( relativeTo ) ) {
		return domainManagementRoot();
	}
	return domainManagementRoot() + '/' + siteName;
}

export function domainManagementEdit( siteName, domainName, relativeTo ) {
	return domainManagementEditBase( siteName, domainName, 'edit', relativeTo );
}

/**
 * @param {string} siteName
 * @param {string} domainName
 * @param {string?} relativeTo
 */
export function domainManagementContactsPrivacy( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'contacts-privacy', relativeTo );
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
export function domainManagementNameServers( siteName, domainName, relativeTo = null ) {
	return domainManagementEditBase( siteName, domainName, 'name-servers', relativeTo );
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

export function domainManagementDnsEditRecord( siteName, domainName, recordId, relativeTo = null ) {
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

export function domainUseMyDomain( siteName, domain, initialMode ) {
	const path = `/domains/add/use-my-domain/${ siteName }`;
	const queryArgs = [];
	if ( domain ) {
		queryArgs.push( `initialQuery=${ domain }` );

		if ( initialMode ) {
			queryArgs.push( `initialMode=${ initialMode }` );
		}
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
