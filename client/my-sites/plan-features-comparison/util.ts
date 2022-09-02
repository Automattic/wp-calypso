import { IncompleteWPcomPlan } from '@automattic/calypso-products';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';

const newsletterFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterSignupFeatures;
};

const linkInBioFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === LINK_IN_BIO_FLOW && plan.getLinkInBioSignupFeatures;
};

const blogFeatures = ( siteType: string, plan: IncompleteWPcomPlan ) => {
	return siteType === 'blog' && plan.getBlogSignupFeatures;
};

const portfolioFeatures = ( siteType: string, plan: IncompleteWPcomPlan ) => {
	return siteType === 'grid' && plan.getPortfolioSignupFeatures;
};

export const getPlanFeatureAccessor = ( {
	flowName = '',
	siteType = '',
	plan,
}: {
	flowName?: string;
	siteType?: string;
	plan: IncompleteWPcomPlan;
} ) => {
	return [
		newsletterFeatures( flowName, plan ),
		linkInBioFeatures( flowName, plan ),
		blogFeatures( siteType, plan ),
		portfolioFeatures( siteType, plan ),
	].find( ( accessor ) => {
		return accessor instanceof Function;
	} );
};

const newsletterHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterHighlightedFeatures;
};

const linkInBioHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === LINK_IN_BIO_FLOW && plan.getLinkInBioHighlightedFeatures;
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

	if ( flowName === LINK_IN_BIO_FLOW && plan.getLinkInBioDescription ) {
		return plan.getLinkInBioDescription();
	}

	return plan.getShortDescription && isInVerticalScrollingPlansExperiment
		? plan.getShortDescription()
		: plan.getDescription();
};
