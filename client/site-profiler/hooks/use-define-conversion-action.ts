import type { HostingProvider, WhoIs } from 'calypso/data/site-profiler/types';

export type CONVERSION_ACTION =
	| 'register-domain'
	| 'transfer-domain'
	| 'transfer-google-domain'
	| 'transfer-google-domain-hosting'
	| 'transfer-hosting'
	| 'transfer-domain-hosting'
	| 'idle';

export default function useDefineConversionAction(
	domain: string,
	whois?: WhoIs,
	isDomainAvailable?: boolean,
	hostingProvider?: HostingProvider
): CONVERSION_ACTION | undefined {
	const isWpDomain = domain.toLowerCase().includes( 'wordpress.com' );
	const isWpAtomicDomain = domain.toLowerCase().includes( 'wpcomstaging.com' );
	const isA8cRegistrar = whois?.registrar?.toLowerCase().includes( 'automattic' );
	const isGoogleRegistrar =
		whois?.registrar?.toLowerCase().includes( 'google' ) ||
		whois?.registrar_whois_server?.toLowerCase().includes( 'google' ) ||
		whois?.registrant_organization?.toLowerCase().includes( 'google' );

	const isA8cDomain = isA8cRegistrar || isWpDomain || isWpAtomicDomain;
	const isA8cHosting = hostingProvider?.slug === 'automattic';

	if ( isDomainAvailable ) {
		return 'register-domain';
	} else if ( isA8cDomain && ! isA8cHosting ) {
		return 'transfer-hosting';
	} else if ( ! isA8cDomain && isGoogleRegistrar && isA8cHosting ) {
		return 'transfer-google-domain';
	} else if ( ! isA8cDomain && isGoogleRegistrar && ! isA8cHosting ) {
		return 'transfer-google-domain-hosting';
	} else if ( ! isA8cDomain && isA8cHosting ) {
		return 'transfer-domain';
	} else if ( ! isA8cDomain && ! isA8cHosting ) {
		return 'transfer-domain-hosting';
	}
	return 'idle';
}
