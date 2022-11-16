import { IncompleteWPcomPlan } from '@automattic/calypso-products';
import {
	NEWSLETTER_FLOW,
	isLinkInBioFlow,
	isNewsletterOrLinkInBioFlow,
} from '@automattic/onboarding';

const newsletterFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterSignupFeatures;
};

const linkInBioFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getLinkInBioSignupFeatures;
};

const signupFlowDefaultFeatures = (
	flowName: string,
	plan: IncompleteWPcomPlan,
	isInVerticalScrollingPlansExperiment: boolean
) => {
	if ( ! flowName || isNewsletterOrLinkInBioFlow( flowName ) ) {
		return;
	}

	return isInVerticalScrollingPlansExperiment
		? plan.getSignupFeatures
		: plan.getSignupCompareAvailableFeatures;
};

export const getPlanFeatureAccessor = ( {
	flowName = '',
	isInVerticalScrollingPlansExperiment = false,
	plan,
}: {
	flowName?: string;
	isInVerticalScrollingPlansExperiment: boolean;
	plan: IncompleteWPcomPlan;
} ) => {
	return [
		newsletterFeatures( flowName, plan ),
		linkInBioFeatures( flowName, plan ),
		signupFlowDefaultFeatures( flowName, plan, isInVerticalScrollingPlansExperiment ),
	].find( ( accessor ) => {
		return accessor instanceof Function;
	} );
};

const newsletterHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterHighlightedFeatures;
};

const linkInBioHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getLinkInBioHighlightedFeatures;
};

export const getHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	const accessor = [
		newsletterHighlightedFeatures( flowName, plan ),
		linkInBioHighlightedFeatures( flowName, plan ),
	].find( ( accessor ) => {
		return accessor instanceof Function;
	} );

	return ( accessor && accessor() ) || [];
};

export const getPlanDescriptionForMobile = ( {
	flowName,
	isInVerticalScrollingPlansExperiment,
	plan,
}: {
	flowName: string;
	isInVerticalScrollingPlansExperiment: boolean;
	plan: IncompleteWPcomPlan;
} ) => {
	if ( flowName === NEWSLETTER_FLOW && plan.getNewsletterDescription ) {
		return plan.getNewsletterDescription();
	}

	if ( isLinkInBioFlow( LINK_IN_BIO_FLOW ) && plan.getLinkInBioDescription ) {
		return plan.getLinkInBioDescription();
	}

	return plan.getShortDescription && isInVerticalScrollingPlansExperiment
		? plan.getShortDescription()
		: plan.getDescription();
};
