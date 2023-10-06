import { useState, useEffect } from 'react';
import { normalizeWhoisField } from '../utils/normalize-whois-entry';
import type { UrlData } from 'calypso/blocks/import/types';
import type {
	DomainAnalyzerQueryResponse,
	HostingProviderQueryResponse,
} from 'calypso/data/site-profiler/types';

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
	siteProfilerData?: DomainAnalyzerQueryResponse,
	hostingProviderData?: HostingProviderQueryResponse,
	urlData?: UrlData | null
): CONVERSION_ACTION | undefined {
	const [ conversionAction, setConversionAction ] = useState< CONVERSION_ACTION | undefined >();

	const isDomainAvailable = siteProfilerData?.is_domain_available;
	const isEligibleGoogleTransfer = siteProfilerData?.eligible_google_transfer;

	const isWpDomain = domain.toLowerCase().includes( 'wordpress.com' );
	const isWpAtomicDomain = domain.toLowerCase().includes( 'wpcomstaging.com' );
	const isWpPlatform = urlData?.platform === 'wordpress';

	const isA8cRegistrar = normalizeWhoisField( siteProfilerData?.whois?.registrar )
		.toLowerCase()
		.includes( 'automattic' );
	const isA8cDomain = isA8cRegistrar || isWpDomain || isWpAtomicDomain;
	const isA8cHosting = hostingProviderData?.hosting_provider?.slug === 'automattic';

	useEffect( () => {
		! domain && setConversionAction( undefined );
	}, [ domain ] );

	useEffect( () => {
		if (
			siteProfilerData === undefined ||
			hostingProviderData === undefined ||
			urlData === undefined
		) {
			return;
		}

		if ( isDomainAvailable ) {
			setConversionAction( 'register-domain' );
		} else if ( isA8cDomain && ! isA8cHosting ) {
			isWpPlatform
				? setConversionAction( 'transfer-hosting-wp' )
				: setConversionAction( 'transfer-hosting' );
		} else if ( ! isA8cDomain && isEligibleGoogleTransfer && isA8cHosting ) {
			setConversionAction( 'transfer-google-domain' );
		} else if ( ! isA8cDomain && isEligibleGoogleTransfer && ! isA8cHosting ) {
			isWpPlatform
				? setConversionAction( 'transfer-google-domain-hosting-wp' )
				: setConversionAction( 'transfer-google-domain-hosting' );
		} else if ( ! isA8cDomain && isA8cHosting ) {
			setConversionAction( 'transfer-domain' );
		} else if ( ! isA8cDomain && ! isA8cHosting ) {
			isWpPlatform
				? setConversionAction( 'transfer-domain-hosting-wp' )
				: setConversionAction( 'transfer-domain-hosting' );
		} else {
			setConversionAction( 'idle' );
		}
	}, [ siteProfilerData, hostingProviderData, urlData ] );

	return conversionAction;
}
