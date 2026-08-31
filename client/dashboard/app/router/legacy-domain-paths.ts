/**
 * Classic Calypso kept domain management under `/domains/manage`. The dashboard
 * serves `/domains/$domainName`, so those paths would otherwise resolve to a
 * domain literally named "manage" and fail with `invalid_domain`. This
 * translates the legacy grammar to its closest dashboard destination.
 *
 * The two families are `/domains/manage/<domain>/<slug>/<site>` and its
 * `/domains/manage/all/…` counterpart. Anything unrecognized falls back to the
 * domains list rather than guessing.
 */

const DOMAINS_LIST = '/domains';

// Legacy slugs with no dashboard counterpart map to the domain overview.
const SUBPAGE_BY_SLUG: Record< string, string > = {
	edit: '',
	'manage-consent': '',
	redirect: '',
	'redirect-settings': '',
	'edit-contact-info': '/contact-info',
	dns: '/dns',
	'add-dns-record': '/dns/add',
	'edit-dns-record': '/dns/edit',
	security: '/security',
	'domain-connect-mapping': '/domain-connection-setup',
};

const SUBPAGE_BY_TRANSFER_TYPE: Record< string, string > = {
	'': '/transfer',
	out: '/transfer',
	in: '/domain-transfer-setup',
	precheck: '/domain-transfer-setup',
	'any-user': '/transfer/any-user',
	'other-user': '/transfer/other-user',
	'other-site': '/transfer/other-site',
};

// Legacy paths encode the domain twice so that site redirects, whose "domain"
// can contain a slash, survive routing. One decode happens before we see it.
function decodeDomain( segment: string ) {
	try {
		return decodeURIComponent( segment );
	} catch {
		return segment;
	}
}

function domainPath( domain: string, subpage = '' ) {
	return `${ DOMAINS_LIST }/${ encodeURIComponent( decodeDomain( domain ) ) }${ subpage }`;
}

/**
 * Maps `<domain>/<slug>[/<extra>]/<site>` — the shape shared by the
 * `/domains/manage/…` and `/domains/manage/all/…` families.
 */
function resolveDomainSubpage( segments: string[] ): string | undefined {
	const [ domain, slug, ...rest ] = segments;

	if ( ! domain || ! slug ) {
		return undefined;
	}

	if ( slug === 'email' ) {
		return `/emails/choose-email-solution/${ encodeURIComponent( decodeDomain( domain ) ) }`;
	}

	if ( slug === 'transfer' ) {
		// The last segment is the site, so a transfer type is only present when
		// more than one segment follows.
		const transferType = rest.length > 1 ? rest[ 0 ] : '';
		const subpage = SUBPAGE_BY_TRANSFER_TYPE[ transferType ];
		return subpage === undefined ? undefined : domainPath( domain, subpage );
	}

	const subpage = SUBPAGE_BY_SLUG[ slug ];
	return subpage === undefined ? undefined : domainPath( domain, subpage );
}

/**
 * Maps the `/domains/manage/all/…` family, which nests the domain under a
 * subpage root instead of leading with it.
 */
function resolveAllSubpage( segments: string[] ): string | undefined {
	const [ root, ...rest ] = segments;

	switch ( root ) {
		case undefined:
		case 'edit-selected-contact-info':
			return DOMAINS_LIST;

		case 'overview': {
			const [ domain, ...tail ] = rest;
			if ( ! domain ) {
				return DOMAINS_LIST;
			}
			// `<domain>/<site>` is the overview itself; anything longer names a
			// subpage between the domain and the site.
			if ( tail.length <= 1 ) {
				return domainPath( domain );
			}
			const [ subpageRoot, ...subpageRest ] = tail;
			if ( subpageRoot === 'dns' ) {
				const action = subpageRest.length > 1 ? subpageRest[ 0 ] : '';
				if ( action === '' ) {
					return domainPath( domain, '/dns' );
				}
				return action === 'add' || action === 'edit'
					? domainPath( domain, `/dns/${ action }` )
					: undefined;
			}
			if ( subpageRoot === 'transfer' && subpageRest[ 0 ] === 'other-site' ) {
				return domainPath( domain, '/transfer/other-site' );
			}
			return undefined;
		}

		case 'email': {
			const [ domain ] = rest;
			return domain
				? `/emails/choose-email-solution/${ encodeURIComponent( decodeDomain( domain ) ) }`
				: '/emails';
		}

		case 'contact-info': {
			const [ action, domain ] = rest;
			return action === 'edit' && domain ? domainPath( domain, '/contact-info' ) : undefined;
		}

		default:
			// `/domains/manage/all/<domain>/<slug>/<site>`, the `relativeTo`
			// variant of the standard management pages.
			return resolveDomainSubpage( segments );
	}
}

/**
 * Resolves the path following `/domains/manage` to a dashboard path.
 */
export function resolveLegacyDomainPath( splat: string ): string {
	const segments = splat.split( '/' ).filter( Boolean );

	if ( segments.length === 0 ) {
		return DOMAINS_LIST;
	}

	const [ first, ...rest ] = segments;

	// `select-site` and `edit` only ever led back to a list, and
	// `edit-selected-contact-info` has no dashboard counterpart.
	if ( first === 'select-site' || first === 'edit' || first === 'edit-selected-contact-info' ) {
		return DOMAINS_LIST;
	}

	if ( first === 'all' ) {
		return resolveAllSubpage( rest ) ?? DOMAINS_LIST;
	}

	// A lone segment is a site slug: the site's domain list.
	if ( segments.length === 1 ) {
		return `/sites/${ encodeURIComponent( first ) }/domains`;
	}

	return resolveDomainSubpage( segments ) ?? DOMAINS_LIST;
}
