import { DomainAvailabilityStatus } from '@automattic/api-core';
import { pickPricing, type NamePulsePricing } from './pricing';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';
import type { DomainAvailability } from '@automattic/api-core';

/**
 * What the per-domain cache holds: a final status with its pricing. WAITING
 * and UNKNOWN never enter the cache; they are query states, not data.
 */
export interface NamePulseVerdict
	extends NamePulsePricing, Pick< NamePulseDomainResult, 'is_realtime' > {
	status: NamePulseDomainStatus.AVAILABLE | NamePulseDomainStatus.TAKEN;
}

/**
 * What a row reads for its name: a cached verdict, or whether the last check
 * failed. No entry at all means the name is still WAITING.
 */
export interface NamePulseVerdictState {
	verdict?: NamePulseVerdict;
	isUnknown: boolean;
}

/**
 * A real-time verdict is never overwritten by a bulk zone-file one.
 */
export const mergeNamePulseVerdict = (
	existing: NamePulseVerdict | undefined,
	update: NamePulseVerdict
): NamePulseVerdict => ( existing?.is_realtime && ! update.is_realtime ? existing : update );

/**
 * A premium name is only offered when its TLD is one we can sell premiums on;
 * the rest read as taken rather than carrying a price we cannot honour.
 */
export const isNamePulseAvailable = ( availability: DomainAvailability ): boolean => {
	if ( availability.status === DomainAvailabilityStatus.AVAILABLE ) {
		return true;
	}

	return (
		availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM &&
		!! availability.is_supported_premium_domain
	);
};

/**
 * The per-domain check is the only source of a premium name's real price: the
 * bulk check prices every name at its TLD's standard rate.
 */
export const toNamePulseRealtimeVerdict = (
	availability: DomainAvailability
): NamePulseVerdict => {
	const available = isNamePulseAvailable( availability );

	return {
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		...pickPricing( availability ),
		cost: available ? availability.cost : undefined,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		is_realtime: true,
	};
};

export const applyNamePulseVerdict = (
	row: NamePulseDomainResult,
	state: NamePulseVerdictState | undefined
): NamePulseDomainResult => {
	if ( state?.verdict ) {
		return { ...row, ...state.verdict };
	}

	if ( state?.isUnknown ) {
		return { ...row, status: NamePulseDomainStatus.UNKNOWN };
	}

	return row;
};
