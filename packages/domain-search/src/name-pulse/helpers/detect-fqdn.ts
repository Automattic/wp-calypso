import { isFreeSubdomainQuery } from '../../helpers/is-free-subdomain-query';
import wpcomMultiLevelTlds from '../../helpers/wpcom-multi-level-tlds.json';
import { sanitizeDomainInput } from './sanitize';

export interface FqdnDetection {
	isFqdn: boolean;
	/**
	 * Sanitized base label, also returned for non-FQDN input.
	 */
	baseName: string;
	tld: string;
	fullDomain: string;
	/** Labels dropped in front of the registrable domain: `shop` in `shop.icecream.com`. */
	subdomain?: string;
	/** Last label of input with no known ending; it is joined into `baseName`. */
	unknownEnding?: string;
	/** `mysite.wordpress.com` or a free `.blog` subdomain; `baseName` is its label. */
	isFreeSubdomain?: true;
}

export type FqdnDetails = Pick< FqdnDetection, 'subdomain' | 'unknownEnding' | 'isFreeSubdomain' >;

const notFqdn = ( baseName: string, details: FqdnDetails = {} ): FqdnDetection => ( {
	isFqdn: false,
	baseName,
	tld: '',
	fullDomain: '',
	...details,
} );

const MAX_TLD_LABELS = Math.max( ...wpcomMultiLevelTlds.map( ( tld ) => tld.split( '.' ).length ) );

/**
 * Splits on dots and sanitizes each label, so stray characters and empty labels
 * (`coffee..com`, `coffee.com.`) do not matter. The longest known ending wins, so
 * `coffee.co.uk` is `co.uk`, not `uk`. With no known ending the labels are joined
 * into one name: `icecream.d` gives `icecreamd`.
 * @example detectFqdn( 'Coffee.COM' ) // { isFqdn: true, baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' }
 */
export function detectFqdn( input: string, tlds: readonly string[] ): FqdnDetection {
	const labels = input.toLowerCase().split( '.' ).map( sanitizeDomainInput ).filter( Boolean );

	const domain = labels.join( '.' );
	const isKnownTld = ( tld: string ) => tlds.includes( tld ) || wpcomMultiLevelTlds.includes( tld );

	// A bare ending (".com", "co.uk") leaves no label to register.
	if ( input.includes( '.' ) && isKnownTld( domain ) ) {
		return notFqdn( '' );
	}

	if ( labels.length < 2 ) {
		return notFqdn( labels[ 0 ] ?? '' );
	}

	// Before the ending check: a free subdomain looks like any other subdomain.
	if ( isFreeSubdomainQuery( domain ) ) {
		return notFqdn( labels[ labels.length - 3 ], { isFreeSubdomain: true } );
	}

	for ( let size = Math.min( MAX_TLD_LABELS, labels.length - 1 ); size > 0; size-- ) {
		const tld = labels.slice( -size ).join( '.' );

		if ( ! isKnownTld( tld ) ) {
			continue;
		}

		const baseName = labels[ labels.length - size - 1 ];
		const subdomain = labels.slice( 0, -size - 1 ).join( '.' );

		if ( baseName.length < 2 ) {
			return notFqdn( baseName );
		}

		return {
			isFqdn: true,
			baseName,
			tld,
			fullDomain: `${ baseName }.${ tld }`,
			...( subdomain ? { subdomain } : {} ),
		};
	}

	// An empty list means it has not arrived yet, not that no ending is valid.
	return notFqdn(
		labels.join( '' ),
		tlds.length > 0 ? { unknownEnding: labels[ labels.length - 1 ] } : {}
	);
}
