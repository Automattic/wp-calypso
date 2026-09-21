import { type NamePulsePricing } from './pricing';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * What the per-domain cache holds: a final status with its pricing. WAITING
 * and UNKNOWN never enter the cache; they are query states, not data.
 */
export interface NamePulseVerdict extends NamePulsePricing {
	status: NamePulseDomainStatus.AVAILABLE | NamePulseDomainStatus.TAKEN;
	/** Set once a real-time check has run; bulk zone-file results never overwrite it. */
	is_realtime?: boolean;
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
