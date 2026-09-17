import { getTld } from '../../helpers/get-tld';
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
}

const notFqdn = ( baseName: string ): FqdnDetection => ( {
	isFqdn: false,
	baseName,
	tld: '',
	fullDomain: '',
} );

/**
 * Multi-level TLDs are matched against the wpcom list first (so `coffee.co.uk`
 * is `co.uk`, not `uk`), then single-level ones against `tlds`. Must run on
 * the raw input, before `sanitizeDomainInput` strips the dots.
 * @example detectFqdn( 'Coffee.COM' ) // { isFqdn: true, baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' }
 */
export function detectFqdn( input: string, tlds: readonly string[] ): FqdnDetection {
	const lowercased = input.toLowerCase().trim();

	if ( ! lowercased.includes( '.' ) ) {
		return notFqdn( sanitizeDomainInput( lowercased ) );
	}

	const tld = getTld( lowercased );

	if ( ! tlds.includes( tld ) && ! wpcomMultiLevelTlds.includes( tld ) ) {
		return notFqdn( sanitizeDomainInput( lowercased ) );
	}

	// `getTld` matches the whole input when it *is* a TLD ("co.uk"), which
	// leaves no label to register.
	if ( tld === lowercased ) {
		return notFqdn( '' );
	}

	const baseName = sanitizeDomainInput( lowercased.slice( 0, -( tld.length + 1 ) ) );

	if ( baseName.length < 2 ) {
		return notFqdn( baseName );
	}

	return {
		isFqdn: true,
		baseName,
		tld,
		fullDomain: `${ baseName }.${ tld }`,
	};
}
