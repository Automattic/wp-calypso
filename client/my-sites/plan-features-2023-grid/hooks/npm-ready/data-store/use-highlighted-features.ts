import {
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_NEWSLETTER_IMPORT_SUBSCRIBERS_FREE,
	FEATURE_UNLIMITED_SUBSCRIBERS,
	FEATURE_PAYMENT_TRANSACTION_FEES_10,
	FEATURE_PAYMENT_TRANSACTION_FEES_8,
	FEATURE_PAYMENT_TRANSACTION_FEES_4,
} from '@automattic/calypso-products';
import type { PlansIntent } from './use-grid-plans';

interface Props {
	intent: PlansIntent | undefined;
	isInSignup?: boolean;
}

/**
 * Returns an array of features that, if they exist for a
 * particular Plan on a pricing table, will be highlighted
 * (ie, moved to the top of the list, and bolded).
 *
 * If the specified features don't exist for a particular
 * Plan, they will be ignored.
 *
 * The Logic for processing the highlightedFeatures
 * lives in the adjacent usePlanFeaturesForGridPlans hook.
 *
 * TODO clk: move to plans data store
 */
const useHighlightedFeatures = ( { intent, isInSignup }: Props ): string[] => {
	if ( isInSignup && intent && 'plans-newsletter' === intent ) {
		return [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_NEWSLETTER_IMPORT_SUBSCRIBERS_FREE,
			FEATURE_UNLIMITED_SUBSCRIBERS,
			FEATURE_PAYMENT_TRANSACTION_FEES_10,
			FEATURE_PAYMENT_TRANSACTION_FEES_8,
			FEATURE_PAYMENT_TRANSACTION_FEES_4,
		];
	}

	return [];
};

export default useHighlightedFeatures;
