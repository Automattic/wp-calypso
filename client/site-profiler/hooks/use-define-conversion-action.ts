import type { HostingProvider } from 'calypso/data/site-profiler/types';

export type CONVERSION_ACTION =
	| 'register-domain'
	| 'transfer-domain'
	| 'transfer-hosting'
	| 'transfer-domain-hosting'
	| 'idle';

export function useDefineConversionAction(
	domain: string,
	isDomainAvailable?: boolean,
	registrar = '',
	hostingProvider?: HostingProvider
): CONVERSION_ACTION | undefined {
	const isWpDomain = domain.toLowerCase().includes( 'wordpress.com' );
	const isWpAtomicDomain = domain.toLowerCase().includes( 'wpcomstaging.com' );
	const isA8cRegistrar = registrar.toLowerCase().includes( 'automattic' );

	const isA8cDomain = isA8cRegistrar || isWpDomain || isWpAtomicDomain;
	const isA8cHosting = hostingProvider?.slug === 'automattic';

	if ( isDomainAvailable ) {
		return 'register-domain';
	} else if ( isA8cDomain && ! isA8cHosting ) {
		return 'transfer-hosting';
	} else if ( ! isA8cDomain && isA8cHosting ) {
		return 'transfer-domain';
	} else if ( ! isA8cDomain && ! isA8cHosting ) {
		return 'transfer-domain-hosting';
	}
	return 'idle';
}
