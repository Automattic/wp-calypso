import { DomainMappingStatus } from '../../data/domain-connection-setup';
import { modeType } from './constants';

export function isMappingVerificationSuccess( mode: string, data: DomainMappingStatus ): boolean {
	if ( modeType.SUGGESTED === mode && data.has_wpcom_nameservers ) {
		return true;
	}

	if ( modeType.ADVANCED === mode && data.has_wpcom_ip_addresses ) {
		return true;
	}

	return !! ( data.has_cloudflare_ip_addresses && data.resolves_to_wpcom );
}
