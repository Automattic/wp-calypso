import {
	TERMS_LIST,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { EFFECTIVE_TERMS_LIST } from '@automattic/plans-grid-next';

type SupportedIntervalTypes = Extract<
	UrlFriendlyTermType,
	'monthly' | 'yearly' | '2yearly' | '3yearly'
>;

const usePlanBillingPeriod = ( {
	intervalType,
	defaultValue,
}: {
	intervalType: SupportedIntervalTypes;
	defaultValue?: ( typeof TERMS_LIST )[ number ];
} ) => {
	const plans: Record< SupportedIntervalTypes, ( typeof EFFECTIVE_TERMS_LIST )[ number ] > = {
		monthly: TERM_MONTHLY,
		yearly: TERM_ANNUALLY,
		'2yearly': TERM_BIENNIALLY,
		'3yearly': TERM_TRIENNIALLY,
	} as const;

	return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
};

export default usePlanBillingPeriod;
