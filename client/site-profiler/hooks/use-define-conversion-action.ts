import type { HostingProvider, WhoIs } from 'calypso/data/site-profiler/types';

export type CONVERSION_ACTION =
	| 'register-domain'
	| 'transfer-domain'
	| 'transfer-google-domain'
	| 'transfer-google-domain-hosting'
	| 'transfer-google-domain-hosting-wp'
	| 'transfer-hosting'
	| 'transfer-hosting-wp'
	| 'transfer-domain-hosting'
	| 'transfer-domain-hosting-wp'
	| 'idle';

export default function useDefineConversionAction(
	domain: string,
	whois?: WhoIs,
	isDomainAvailable?: boolean,
	isEligibleGoogleTransfer?: boolean,
	hostingProvider?: HostingProvider,
	isWordPressPlatform?: boolean
): CONVERSION_ACTION | undefined {
	const isWpDomain = domain.toLowerCase().includes( 'wordpress.com' );
	const isWpAtomicDomain = domain.toLowerCase().includes( 'wpcomstaging.com' );
	const isA8cRegistrar = whois?.registrar?.toLowerCase().includes( 'automattic' );

	const isA8cDomain = isA8cRegistrar || isWpDomain || isWpAtomicDomain;
	const isA8cHosting = hostingProvider?.slug === 'automattic';

	if ( isDomainAvailable ) {
		return 'register-domain';
	} else if ( isA8cDomain && ! isA8cHosting ) {
		if ( isWordPressPlatform ) {
			return 'transfer-hosting-wp';
		}
		return 'transfer-hosting';
	} else if ( ! isA8cDomain && isEligibleGoogleTransfer && isA8cHosting ) {
		return 'transfer-google-domain';
	} else if ( ! isA8cDomain && isEligibleGoogleTransfer && ! isA8cHosting ) {
		if ( isWordPressPlatform ) {
			return 'transfer-google-domain-hosting-wp';
		}
		return 'transfer-google-domain-hosting';
	} else if ( ! isA8cDomain && isA8cHosting ) {
		return 'transfer-domain';
	} else if ( ! isA8cDomain && ! isA8cHosting ) {
		if ( isWordPressPlatform ) {
			return 'transfer-domain-hosting-wp';
		}
		return 'transfer-domain-hosting';
	}
	return 'idle';
}
