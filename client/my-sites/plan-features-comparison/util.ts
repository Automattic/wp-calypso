import { IncompleteWPcomPlan } from '@automattic/calypso-products';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';

export const getPlanFeatureAccessor = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	if ( flowName === NEWSLETTER_FLOW && plan.getNewsletterSignupFeatures ) {
		return plan.getNewsletterSignupFeatures;
	} else if ( flowName === LINK_IN_BIO_FLOW && plan.getLinkInBioSignupFeatures ) {
		return plan.getLinkInBioSignupFeatures;
	} else if ( plan.getSignupCompareAvailableFeatures ) {
		return plan.getSignupCompareAvailableFeatures;
	}
};

export const getHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	if ( flowName === NEWSLETTER_FLOW && plan.getNewsletterHighlightedFeatures ) {
		return plan.getNewsletterHighlightedFeatures();
	}

	if ( flowName === LINK_IN_BIO_FLOW && plan.getLinkInBioHighlightedFeatures ) {
		return plan.getLinkInBioHighlightedFeatures();
	}

	return [];
};
