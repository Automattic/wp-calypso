import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';

export type TermPricing = 'monthly' | 'yearly';

// Shared with the classic A4A marketplace so the billing term carries over between dashboards.
const TERM_PRICING_PREFERENCE = 'a4a-marketplace-term-pricing' as const;

export function useTermPricing() {
	const { data: termPricing = 'yearly' } = useQuery(
		userPreferenceQuery( TERM_PRICING_PREFERENCE )
	);
	const { mutate: setTermPricing } = useMutation(
		userPreferenceOptimisticMutation( TERM_PRICING_PREFERENCE )
	);

	return { termPricing, setTermPricing };
}
