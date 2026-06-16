import type { DisplayVariant } from 'calypso/lib/purchases/utils';

export type CancellationTopNotice = 'refund-eligibility' | 'confirmed' | 'time-remaining' | null;

/**
 * Decides which notice renders at the top of the cancellation flow. The outcomes are mutually
 * exclusive: for a single `displayVariant` and a boolean `hasRefund`, at most one notice shows.
 *
 * - refund available + cancel variant → 'refund-eligibility' (the "Remove and refund" CTA)
 * - refund available + remove variant → 'confirmed'
 * - no refund, or the auto-renew variant → 'time-remaining'
 * - while the domain-options step is showing → null (no top notice)
 */
export function getCancellationTopNotice( {
	showDomainOptionsStep,
	hasRefund,
	displayVariant,
}: {
	showDomainOptionsStep: boolean;
	hasRefund: boolean;
	displayVariant: DisplayVariant;
} ): CancellationTopNotice {
	if ( showDomainOptionsStep ) {
		return null;
	}
	if ( ! hasRefund ) {
		return 'time-remaining';
	}
	switch ( displayVariant ) {
		case 'cancel':
			return 'refund-eligibility';
		case 'remove':
			return 'confirmed';
		case 'auto-renew':
			return 'time-remaining';
	}
}
