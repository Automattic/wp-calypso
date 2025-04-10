import {
	TERMS_LIST,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import { EFFECTIVE_TERMS_LIST } from '../../constants';
import type { SupportedUrlFriendlyTermType } from '../../types';

const usePlanBillingPeriod = ( {
	intervalType,
	defaultValue,
}: {
	intervalType: SupportedUrlFriendlyTermType;
	defaultValue?: ( typeof TERMS_LIST )[ number ];
} ) => {
	const plans: Record< SupportedUrlFriendlyTermType, ( typeof EFFECTIVE_TERMS_LIST )[ number ] > = {
		monthly: TERM_MONTHLY,
		yearly: TERM_ANNUALLY,
		'2yearly': TERM_BIENNIALLY,
		'3yearly': TERM_TRIENNIALLY,
	} as const;

	return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
};

export default usePlanBillingPeriod;
