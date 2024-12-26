import config from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { stringify } from 'qs';
import { ResponseDomain } from './types';

export const emailManagementAllSitesPrefix = '/email/all';

export function domainManagementLink(
	{ domain, type }: Pick< ResponseDomain, 'domain' | 'type' >,
	siteSlug: string,
	isAllSitesView: boolean,
	feature?: string
) {
	const viewSlug = domainManagementViewSlug( type );

	// Encodes only real domain names and not parameter placeholders
	if ( ! domain.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domain = encodeURIComponent( encodeURIComponent( domain ) );
	}

	const isAllDomainManagementEnabled = config.isEnabled( 'calypso/all-domain-management' );

	if ( isAllDomainManagementEnabled && isAllSitesView ) {
		switch ( feature ) {
			case 'email-management':
				return `${ domainManagementAllRoot() }/email/${ domain }/${ siteSlug }`;

			case 'domain-overview':
			default:
				return `${ domainManagementAllRoot() }/overview/${ domain }/${ siteSlug }`;
		}
	}

	if ( isAllSitesView ) {
		return `${ domainManagementAllRoot() }/${ domain }/${ viewSlug }/${ siteSlug }`;
	}

	return `${ domainManagementRoot() }/${ domain }/${ viewSlug }/${ siteSlug }`;
}

export function domainManagementTransferToOtherSiteLink( siteSlug: string, domainName: string ) {
	return `${ domainManagementAllRoot() }/${ domainName }/transfer/other-site/${ siteSlug }`;
}

function domainManagementViewSlug( type: ResponseDomain[ 'type' ] ) {
	switch ( type ) {
		case 'transfer':
			return 'transfer/in';
		case 'redirect':
			return 'redirect';
		default:
			return 'edit';
	}
}

export function domainOnlySiteCreationLink( siteSlug: string, siteId: number ) {
	return addQueryArgs( '/start/site-selected/', { siteSlug, siteId } );
}

function resolveRootPath( relativeTo: string | null = null ) {
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
	siteName: string,
	domainName: string,
	slug: string,
	relativeTo: string | null = null,
	queryArgs = {}
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
		return addQueryArgs( baseUrl, queryArgs );
	}

	return baseUrl;
}

export function domainManagementRoot() {
	return '/domains/manage';
}

export function isUnderDomainManagementAll( path: string ) {
	return path?.startsWith( domainManagementAllRoot() + '/' ) || path === domainManagementRoot();
}

export function domainManagementAllRoot() {
	return '/domains/manage/all';
}

export function domainManagementEditContactInfo(
	siteName: string,
	domainName: string,
	relativeTo: string | null = null
) {
	return domainManagementEditBase( siteName, domainName, 'edit-contact-info', relativeTo );
}

export function domainMappingSetup(
	siteName: string,
	domainName: string,
	step = '',
	showErrors = false,
	firstVisit = false
) {
	let path = `/domains/mapping/${ siteName }/setup/${ domainName }`;
	const params = {
		step: '',
		'show-errors': false,
		firstVisit: false,
	};

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

export function domainUseMyDomain( siteName: string, domain: string, initialMode: string ) {
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

export function domainManagementEdit(
	siteName: string,
	domainName: string,
	relativeTo: string | null = null,
	expandSections = {}
) {
	return domainManagementEditBase( siteName, domainName, 'edit', relativeTo, expandSections );
}

export function domainManagementTransfer(
	siteName: string,
	domainName: string,
	relativeTo: string | null = null
) {
	return domainManagementEditBase( siteName, domainName, 'transfer', relativeTo );
}

export function isUnderEmailManagementAll( path: string ) {
	return path?.startsWith( emailManagementAllSitesPrefix + '/' );
}

export function domainMagementDNS( siteName: string, domainName: string ) {
	return domainManagementEditBase( siteName, domainName, 'dns' );
}

export function emailManagementEdit( siteSlug: string, domainName: string ) {
	// Encodes only real domain names and not parameter placeholders
	if ( domainName && ! String( domainName ).startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return '/email/' + domainName + '/manage/' + siteSlug;
}
