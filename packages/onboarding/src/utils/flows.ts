export const NEWSLETTER_FLOW = 'newsletter';
export const NEWSLETTER_POST_SETUP_FLOW = 'newsletter-post-setup';
export const LINK_IN_BIO_FLOW = 'link-in-bio';
export const LINK_IN_BIO_TLD_FLOW = 'link-in-bio-tld';
export const LINK_IN_BIO_POST_SETUP_FLOW = 'link-in-bio-post-setup';
export const VIDEOPRESS_FLOW = 'videopress';
export const IMPORT_FOCUSED_FLOW = 'import-focused';
export const ECOMMERCE_FLOW = 'ecommerce';
export const WOOEXPRESS_FLOW = 'wooexpress';
export const FREE_FLOW = 'free';
export const FREE_POST_SETUP_FLOW = 'free-post-setup';
export const MIGRATION_FLOW = 'import-focused';
export const COPY_SITE_FLOW = 'copy-site';
export const BUILD_FLOW = 'build';

export const isLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[ LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW, LINK_IN_BIO_POST_SETUP_FLOW ].includes( flowName )
	);
};

export const isFreeFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ FREE_FLOW, FREE_POST_SETUP_FLOW ].includes( flowName ) );
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

export const isMigrationFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ MIGRATION_FLOW ].includes( flowName ) );
};

export const isCopySiteFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ COPY_SITE_FLOW ].includes( flowName ) );
};

export const isWooExpressFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ WOOEXPRESS_FLOW ].includes( flowName ) );
};

export const isBuildFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ BUILD_FLOW ].includes( flowName ) );
};

export const ecommerceFlowRecurTypes = {
	YEARLY: 'yearly',
	MONTHLY: 'monthly',
};
