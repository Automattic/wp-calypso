import { parseDomainAgainstTldList } from '../parse-domain-against-tld-list';
import wpcomMultiLevelTlds from '../wpcom-multi-level-tlds.json';
import { NAME_PULSE_TLDS } from './constants';
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
 * Detect whether the raw input is `<label>.<known tld>`. Multi-level TLDs are
 * matched against the wpcom list first (so `coffee.co.uk` is `co.uk`, not `uk`),
 * then single-level TLDs against the exact-match list. Must run on the raw
 * input, before `sanitizeDomainInput` strips the dots.
 * @example detectFqdn( 'Coffee.COM' ) // { isFqdn: true, baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' }
 */
export function detectFqdn(
	input: string,
	tlds: readonly string[] = NAME_PULSE_TLDS
): FqdnDetection {
	const lowercased = input.toLowerCase().trim();

	if ( ! lowercased.includes( '.' ) ) {
		return notFqdn( sanitizeDomainInput( lowercased ) );
	}

	let tld = parseDomainAgainstTldList( lowercased, wpcomMultiLevelTlds );

	if ( ! tld ) {
		tld = lowercased.slice( lowercased.lastIndexOf( '.' ) + 1 );

		if ( ! tlds.includes( tld ) ) {
			return notFqdn( sanitizeDomainInput( lowercased ) );
		}
	}

	// `parseDomainAgainstTldList` matches the whole input when it *is* a TLD
	// ("co.uk"), which leaves no label to register.
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
