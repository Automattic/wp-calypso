import {
	applyTestFiltersToPlansList,
	getPlan,
	FEATURE_CUSTOM_DOMAIN,
	IncompleteWPcomPlan,
} from '@automattic/calypso-products';
import {
	NEWSLETTER_FLOW,
	isLinkInBioFlow,
	isAnyHostingFlow,
	isNewsletterOrLinkInBioFlow,
	isBlogOnboardingFlow,
	isSenseiFlow,
} from '@automattic/onboarding';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';

const newsletterFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return flowName === NEWSLETTER_FLOW && plan.getNewsletterSignupFeatures;
};

const linkInBioFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getLinkInBioSignupFeatures;
};

const hostingFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isAnyHostingFlow( flowName ) && plan.getHostingSignupFeatures?.( plan.term );
};

const blogOnboardingFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isBlogOnboardingFlow( flowName ) && plan.getBlogOnboardingSignupFeatures;
};

const senseiFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isSenseiFlow( flowName ) && plan.getSenseiFeatures?.( plan.term );
};

const signupFlowDefaultFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	if ( ! flowName || isNewsletterOrLinkInBioFlow( flowName ) ) {
		return;
	}

	return plan.getSignupCompareAvailableFeatures;
};

const getPlanFeatureAccessor = ( {
	flowName = '',
	plan,
}: {
	flowName?: string;
	plan: IncompleteWPcomPlan;
} ) => {
	return [
		newsletterFeatures( flowName, plan ),
		linkInBioFeatures( flowName, plan ),
		hostingFeatures( flowName, plan ),
		blogOnboardingFeatures( flowName, plan ),
		senseiFeatures( flowName, plan ),
		signupFlowDefaultFeatures( flowName, plan ),
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

const hostingHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isLinkInBioFlow( flowName ) && plan.getHostingHighlightedFeatures;
};

const blogOnboardingHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isBlogOnboardingFlow( flowName ) && plan.getBlogOnboardingHighlightedFeatures;
};

const senseiHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	return isSenseiFlow( flowName ) && plan.getSenseiHighlightedFeatures;
};

const getHighlightedFeatures = ( flowName: string, plan: IncompleteWPcomPlan ) => {
	const accessor = [
		newsletterHighlightedFeatures( flowName, plan ),
		linkInBioHighlightedFeatures( flowName, plan ),
		hostingHighlightedFeatures( flowName, plan ),
		blogOnboardingHighlightedFeatures( flowName, plan ),
		senseiHighlightedFeatures( flowName, plan ),
	].find( ( accessor ) => {
		return accessor instanceof Function;
	} );

	return ( accessor && accessor() ) || [];
};

export default function getFlowPlanFeatures(
	flowName: string,
	product: ResponseCartProduct | undefined,
	hasDomainsInCart: boolean,
	hasRenewalInCart: boolean,
	nextDomainIsFree: boolean
) {
	const productSlug = product?.product_slug;

	if ( ! productSlug ) {
		return [];
	}

	const plan = getPlan( productSlug );

	if ( ! plan ) {
		return [];
	}

	const planConstantObj = applyTestFiltersToPlansList( plan, undefined );

	if ( ! planConstantObj ) {
		return [];
	}

	const featureAccessor = getPlanFeatureAccessor( {
		flowName,
		plan: planConstantObj,
	} );

	if ( ! featureAccessor ) {
		return [];
	}

	const highlightedFeatures = getHighlightedFeatures( flowName, planConstantObj );
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart && nextDomainIsFree;
	return getPlanFeaturesObject( featureAccessor() )
		.filter( ( feature ) => {
			return showFreeDomainFeature || feature.getSlug() !== FEATURE_CUSTOM_DOMAIN;
		} )
		.map( ( feature ) => {
			return {
				...feature,
				isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
			};
		} );
}
