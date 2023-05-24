import { IncompleteWPcomPlan, isMonthly } from '@automattic/calypso-products';
import {
	NEWSLETTER_FLOW,
	isLinkInBioFlow,
	isHostingFlow,
	isNewsletterOrLinkInBioFlow,
} from '@automattic/onboarding';

const newsletterFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterSignupFeatures;
};

const linkInBioFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getLinkInBioSignupFeatures;
};

const hostingFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isHostingFlow( flowName ) && plan.getHostingSignupFeatures;
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
	isInVerticalScrollingPlansExperiment?: boolean;
	plan: IncompleteWPcomPlan;
} ) => {
	const planFeatureAccessor = [
		newsletterFeatures( flowName, plan ),
		linkInBioFeatures( flowName, plan ),
		hostingFeatures( flowName, plan ),
		signupFlowDefaultFeatures( flowName, plan, isInVerticalScrollingPlansExperiment ),
	].find( ( accessor ) => {
		return accessor instanceof Function;
	} );

	if ( ! planFeatureAccessor ) {
		return planFeatureAccessor;
	}

	const planSlug = plan.getStoreSlug?.();

	if ( ! planSlug || ! isMonthly( planSlug ) ) {
		return planFeatureAccessor();
	}

	const annualOnlyFeatures = plan.getAnnualPlansOnlyFeatures?.() ?? [];

	if ( annualOnlyFeatures.length === 0 ) {
		return planFeatureAccessor();
	}

	return planFeatureAccessor().filter( ( feature ) => {
		return ! annualOnlyFeatures.includes( feature );
	} );
};

const newsletterHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterHighlightedFeatures;
};

const linkInBioHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getLinkInBioHighlightedFeatures;
};

const hostingHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getHostingHighlightedFeatures;
};

export const getHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	const accessor = [
		newsletterHighlightedFeatures( flowName, plan ),
		linkInBioHighlightedFeatures( flowName, plan ),
		hostingHighlightedFeatures( flowName, plan ),
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

	if ( isLinkInBioFlow( flowName ) && plan.getLinkInBioDescription ) {
		return plan.getLinkInBioDescription();
	}

	return plan.getShortDescription && isInVerticalScrollingPlansExperiment
		? plan.getShortDescription()
		: plan.getDescription();
};
