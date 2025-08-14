// Validation helpers for domain forwarding form

import type { FormData } from './form';
import type { DomainForwarding, DomainForwardingSaveData } from '../../data/domain-forwarding';

const SOFT_URL_REGEX =
	/^(https?:)?(?:[a-zA-Z0-9-.]+\.)?[a-zA-Z]{0,}(?:\/[^\s]*){0,}(:[0-9/a-z-#]*)?$/i;
const SUBDOMAIN_LABEL_REGEX = /^(?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/i;

export function normalizeUrlWithDefaultProtocol( input: string ): string {
	if ( ! input ) {
		return '';
	}
	return /^https?:\/\//i.test( input ) ? input : `https://${ input }`;
}

function getDomainPartsAndLevel( domain: string ): [ string[], number ] {
	const parts = domain.split( '.' );
	return [ parts, parts.length ];
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

export function isTargetUrlValid( value: string, fullDomain: string ): boolean {
	const input = value?.trim() || '';
	if ( ! input ) {
		return false;
	}
	const normalized = normalizeUrlWithDefaultProtocol( input );
	if ( ! SOFT_URL_REGEX.test( normalized ) ) {
		return false;
	}
	try {
		const url = new URL( normalized );
		const [ domainParts, domainLevel ] = getDomainPartsAndLevel( fullDomain );
		const [ targetHostParts, targetHostLevel ] = getDomainPartsAndLevel( url.hostname );

		if ( domainLevel > targetHostLevel ) {
			return true;
		}
		if ( domainLevel === targetHostLevel ) {
			if ( isSameDomain( domainParts, targetHostParts, domainLevel ) ) {
				const targetPath = url.pathname + url.search + url.hash;
				if ( ! targetPath || /^\/+$/.test( targetPath ) ) {
					return false; // same domain root disallowed
				}
			}
			return true;
		}
		if ( isSubdomain( domainParts, targetHostParts, domainLevel, targetHostLevel ) ) {
			return false; // further nested subdomain disallowed
		}
		return true;
	} catch {
		return false;
	}
}

export function isSubdomainValid( value: string ): boolean {
	if ( ! value ) {
		return true; // treat empty as valid; field presence is controlled by form config
	}
	return SUBDOMAIN_LABEL_REGEX.test( value );
}

export function parseTargetUrl( targetUrl: string ) {
	try {
		// Add protocol if missing
		const urlWithProtocol = normalizeUrlWithDefaultProtocol( targetUrl );
		const url = new URL( urlWithProtocol );

		return {
			target_host: url.hostname,
			target_path: url.pathname + url.search + url.hash,
			is_secure: url.protocol === 'https:',
		};
	} catch {
		// Fallback for invalid URLs - treat as hostname only
		return {
			target_host: targetUrl.replace( /^https?:\/\//, '' ).split( '/' )[ 0 ],
			target_path: '',
			is_secure: targetUrl.startsWith( 'https://' ),
		};
	}
}

export function formDataToSubmitData(
	formData: FormData,
	existingForwarding?: DomainForwarding
): DomainForwardingSaveData {
	const { target_host, target_path, is_secure } = parseTargetUrl( formData.targetUrl );

	const submitData: DomainForwardingSaveData = {
		subdomain:
			formData.sourceType === 'subdomain' ? formData.subdomain.trim() || undefined : undefined,
		target_host,
		target_path,
		is_secure,
		is_permanent: formData.isPermanent,
		forward_paths: formData.forwardPaths,
	};

	// Add domain_redirect_id for edit operations
	if ( existingForwarding ) {
		submitData.domain_redirect_id = existingForwarding.domain_redirect_id;
	}

	return submitData;
}
