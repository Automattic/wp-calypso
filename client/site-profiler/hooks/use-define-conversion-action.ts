import type { HostingProvider } from 'calypso/data/site-profiler/types';

export type CONVERSION_ACTION =
	| 'register-domain'
	| 'transfer-domain'
	| 'transfer-hosting'
	| 'transfer-domain-hosting'
	| 'idle';

export function useDefineConversionAction(
	isDomainAvailable?: boolean,
	nameServer: string[] = [],
	hostingProvider?: HostingProvider
): CONVERSION_ACTION | undefined {
	const isWpNs = !! nameServer.filter(
		( ns ) => ns.includes( 'automattic.com' ) || ns.includes( 'wordpress.com' )
	).length;

	if ( isDomainAvailable ) {
		return 'register-domain';
	} else if ( isWpNs && hostingProvider?.slug !== 'automattic' ) {
		return 'transfer-hosting';
	} else if ( ! isWpNs && hostingProvider?.slug === 'automattic' ) {
		return 'transfer-domain';
	} else if ( ! isWpNs && hostingProvider?.slug !== 'automattic' ) {
		return 'transfer-domain-hosting';
	}
	return 'idle';
}
