import { translate } from 'i18n-calypso';

function isSubdomain(
	domainParts: string[],
	targetHostParts: string[],
	domainLevel: number,
	targetHostLevel: number
): boolean {
	for ( let i = 1; i <= Math.min( domainLevel, targetHostLevel ); i++ ) {
		if ( domainParts[ domainLevel - i ] !== targetHostParts[ targetHostLevel - i ] ) {
			return false;
		}
	}
	return true;
}

function isSameDomain(
	domainParts: string[],
	targetHostParts: string[],
	domainLevel: number
): boolean {
	for ( let i = 0; i < domainLevel; i++ ) {
		if ( domainParts[ i ] !== targetHostParts[ i ] ) {
			return false;
		}
	}
	return true;
}

function getDomainPartsAndLevel( domain: string ): [ string[], number ] {
	const parts = domain.split( '.' );
	return [ parts, parts.length ];
}

export function validateDomainForwarding(
	fullDomain: string,
	targetHost: string,
	targetPath: string
): { isValid: boolean; errorMsg: string } {
	const [ domainParts, domainLevel ] = getDomainPartsAndLevel( fullDomain );
	const [ targetHostParts, targetHostLevel ] = getDomainPartsAndLevel( targetHost );

	if ( domainLevel > targetHostLevel ) {
		return { isValid: true, errorMsg: '' };
	}

	if ( domainLevel === targetHostLevel ) {
		if (
			isSameDomain( domainParts, targetHostParts, domainLevel ) &&
			( ! targetPath || /^\/+$/.test( targetPath ) )
		) {
			return {
				isValid: false,
				errorMsg: translate( 'Forwarding to the same domain is not allowed.' ),
			};
		}
		return { isValid: true, errorMsg: '' };
	}

	if ( ! isSubdomain( domainParts, targetHostParts, domainLevel, targetHostLevel ) ) {
		return { isValid: true, errorMsg: '' };
	}
	return {
		isValid: false,
		errorMsg: translate( 'Forwarding to a further nested domain is not allowed.' ),
	};
}
