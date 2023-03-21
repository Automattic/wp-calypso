export const NEWSLETTER_FLOW = 'newsletter';
export const NEWSLETTER_POST_SETUP_FLOW = 'newsletter-post-setup';
export const HOSTING_LP_FLOW = 'hosting';
export const LINK_IN_BIO_FLOW = 'link-in-bio';
export const LINK_IN_BIO_TLD_FLOW = 'link-in-bio-tld';
export const LINK_IN_BIO_POST_SETUP_FLOW = 'link-in-bio-post-setup';
export const VIDEOPRESS_FLOW = 'videopress';
export const IMPORT_FOCUSED_FLOW = 'import-focused';
export const SENSEI_FLOW = 'sensei';
export const ECOMMERCE_FLOW = 'ecommerce';
export const WOOEXPRESS_FLOW = 'wooexpress';
export const FREE_FLOW = 'free';
export const FREE_POST_SETUP_FLOW = 'free-post-setup';
export const MIGRATION_FLOW = 'import-focused';
export const COPY_SITE_FLOW = 'copy-site';
export const BUILD_FLOW = 'build';
export const WRITE_FLOW = 'write';
export const SITE_SETUP_FLOW = 'site-setup';
export const WITH_THEME_FLOW = 'with-theme';
export const WITH_THEME_ASSEMBLER_FLOW = 'with-theme-assembler';
export const UPDATE_DESIGN_FLOW = 'update-design';
export const DOMAIN_UPSELL_FLOW = 'domain-upsell';

export const isLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[ LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW, LINK_IN_BIO_POST_SETUP_FLOW ].includes( flowName )
	);
};

export const isNewsletterFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName && [ NEWSLETTER_FLOW, NEWSLETTER_POST_SETUP_FLOW ].includes( flowName )
	);
};

export const isFreeFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ FREE_FLOW, FREE_POST_SETUP_FLOW ].includes( flowName ) );
};

export const isHostingLPFlow = ( flowName: string | null ) => {
	return Boolean( flowName && HOSTING_LP_FLOW === flowName );
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

export const isWriteFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ WRITE_FLOW ].includes( flowName ) );
};

export const isUpdateDesignFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ UPDATE_DESIGN_FLOW ].includes( flowName ) );
};

export const isSiteAssemblerFlow = ( flowName: string | null ) => {
	const SITE_ASSEMBLER_FLOWS = [ WITH_THEME_ASSEMBLER_FLOW ];

	return !! flowName && SITE_ASSEMBLER_FLOWS.includes( flowName );
};

export const isWithThemeFlow = ( flowName: string | null ) => {
	const WITH_THEME_FLOWS = [ WITH_THEME_FLOW, WITH_THEME_ASSEMBLER_FLOW ];

	return !! flowName && WITH_THEME_FLOWS.includes( flowName );
};

export const ecommerceFlowRecurTypes = {
	YEARLY: 'yearly',
	MONTHLY: 'monthly',
	'2Y': '2Y',
	'3Y': '3Y',
};
