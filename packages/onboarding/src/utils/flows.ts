export const NEWSLETTER_FLOW = 'newsletter';
export const NEWSLETTER_POST_SETUP_FLOW = 'newsletter-post-setup';
export const LINK_IN_BIO_FLOW = 'link-in-bio';
export const LINK_IN_BIO_TLD_FLOW = 'link-in-bio-tld';
export const LINK_IN_BIO_POST_SETUP_FLOW = 'link-in-bio-post-setup';
export const VIDEOPRESS_FLOW = 'videopress';
export const IMPORT_FOCUSED_FLOW = 'import-focused';
export const ECOMMERCE_FLOW = 'ecommerce';
export const FREE_FLOW = 'free';
export const BUSINESS_FLOW = 'business';
export const PREMIUM_FLOW = 'premium';
export const PERSONAL_FLOW = 'personal';
export const ECOMMERCE_MONTHLY_FLOW = 'ecommerce-monthly';
export const BUSINESS_MONTHLY_FLOW = 'business-monthly';
export const PREMIUM_MONTHLY_FLOW = 'premium-monthly';
export const PERSONAL_MONTHLY_FLOW = 'personal-monthly';

export const isLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[ LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW, LINK_IN_BIO_POST_SETUP_FLOW ].includes( flowName )
	);
};

export const isFreeFlow = ( flowName: string | null ) => {
	return Boolean( flowName && FREE_FLOW === flowName );
};

export const isNewsletterOrLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[
				NEWSLETTER_FLOW,
				NEWSLETTER_POST_SETUP_FLOW,
				LINK_IN_BIO_FLOW,
				LINK_IN_BIO_TLD_FLOW,
				LINK_IN_BIO_POST_SETUP_FLOW,
			].includes( flowName )
	);
};

export const isTailoredSignupFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			( isNewsletterOrLinkInBioFlow( flowName ) ||
				VIDEOPRESS_FLOW === flowName ||
				ECOMMERCE_FLOW === flowName ||
				FREE_FLOW === flowName )
	);
};

export const ecommerceFlowRecurTypes = {
	YEARLY: 'yearly',
	MONTHLY: 'monthly',
};

export const isCurrentPlanFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[
				ECOMMERCE_FLOW,
				BUSINESS_FLOW,
				PREMIUM_FLOW,
				PERSONAL_FLOW,
				ECOMMERCE_MONTHLY_FLOW,
				BUSINESS_MONTHLY_FLOW,
				PREMIUM_MONTHLY_FLOW,
				PERSONAL_MONTHLY_FLOW,
			].includes( flowName )
	);
};
