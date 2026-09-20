import { getTld } from '../../helpers/get-tld';
import { isFreeSubdomainQuery } from '../../helpers/is-free-subdomain-query';
import wpcomMultiLevelTlds from '../../helpers/wpcom-multi-level-tlds.json';
import { sanitizeDomainInput } from './sanitize';

/**
 * Why the input was not taken at face value. The search still runs on
 * `baseName`; the issue is what the notice above the results explains.
 */
export type FqdnIssue =
	| { type: 'unknown-tld'; ending: string }
	| { type: 'subdomain'; rootDomain: string }
	| { type: 'free-subdomain' };

export interface FqdnDetection {
	isFqdn: boolean;
	/**
	 * Sanitized base label, also returned for non-FQDN input.
	 */
	baseName: string;
	tld: string;
	fullDomain: string;
	issue?: FqdnIssue;
}

const notFqdn = ( baseName: string, issue?: FqdnIssue ): FqdnDetection => ( {
	isFqdn: false,
	baseName,
	tld: '',
	fullDomain: '',
	...( issue ? { issue } : {} ),
} );

/**
 * Multi-level TLDs are matched against the wpcom list first (so `coffee.co.uk`
 * is `co.uk`, not `uk`), then single-level ones against `tlds`. Must run on
 * the raw input, before `sanitizeDomainInput` strips the dots.
 *
 * Every dotted input that is not a registrable domain still yields a base name
 * to search, taken from the label next to the ending rather than from the whole
 * string: `icecream.d` searches `icecream`, not `icecreamd`.
 * @example detectFqdn( 'Coffee.COM' ) // { isFqdn: true, baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' }
 */
export function detectFqdn( input: string, tlds: readonly string[] ): FqdnDetection {
	const lowercased = input.toLowerCase().trim();

	if ( ! lowercased.includes( '.' ) ) {
		return notFqdn( sanitizeDomainInput( lowercased ) );
	}

	const labels = lowercased.split( '.' );

	// Checked before the TLD, because a free subdomain is shaped like any other
	// subdomain of a registrable domain ("mysite.wordpress.com").
	if ( isFreeSubdomainQuery( lowercased ) ) {
		return notFqdn( sanitizeDomainInput( labels[ 0 ] ), { type: 'free-subdomain' } );
	}

	const tld = getTld( lowercased );

	if ( ! tlds.includes( tld ) && ! wpcomMultiLevelTlds.includes( tld ) ) {
		// An empty list means it has not arrived yet, not that every ending is
		// unrecognised. The caller re-runs once it does.
		const issue: FqdnIssue | undefined =
			tlds.length > 0 ? { type: 'unknown-tld', ending: labels[ labels.length - 1 ] } : undefined;

		return notFqdn( sanitizeDomainInput( labels[ labels.length - 2 ] ), issue );
	}

	// `getTld` matches the whole input when it *is* a TLD ("co.uk"), which
	// leaves no label to register.
	if ( tld === lowercased ) {
		return notFqdn( '' );
	}

	const remainder = lowercased.slice( 0, -( tld.length + 1 ) ).split( '.' );
	const baseName = sanitizeDomainInput( remainder[ remainder.length - 1 ] );

	if ( baseName.length < 2 ) {
		return notFqdn( baseName );
	}

	const fullDomain = `${ baseName }.${ tld }`;
	const issue: FqdnIssue | undefined =
		remainder.length > 1 ? { type: 'subdomain', rootDomain: fullDomain } : undefined;

	return {
		isFqdn: true,
		baseName,
		tld,
		fullDomain,
		...( issue ? { issue } : {} ),
	};
}
