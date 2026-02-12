import { useMemo } from 'react';

interface UseDnsRecordNamesParams {
	domainName: string;
	isSubdomain: boolean;
	rootDomain?: string;
}

interface UseDnsRecordNamesReturn {
	recordName: string;
	cnameRecordName: string;
}

/**
 * Custom hook to calculate DNS record names based on domain configuration.
 */
export function useDnsRecordNames( {
	domainName,
	isSubdomain,
	rootDomain,
}: UseDnsRecordNamesParams ): UseDnsRecordNamesReturn {
	const recordName = useMemo( () => {
		if ( isSubdomain && rootDomain ) {
			const suffix = `.${ rootDomain }`;

			if ( domainName.endsWith( suffix ) ) {
				const subdomain = domainName.slice( 0, -suffix.length );
				return subdomain || domainName;
			}

			return domainName;
		}

		return '@';
	}, [ isSubdomain, rootDomain, domainName ] );

	const cnameRecordName = useMemo( () => {
		if ( recordName === '@' ) {
			return 'www';
		}

		return `www.${ recordName }`;
	}, [ recordName ] );

	return {
		recordName,
		cnameRecordName,
	};
}
