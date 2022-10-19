export const NEWSLETTER_FLOW = 'newsletter';
export const NEWSLETTER_POST_SETUP_FLOW = 'newsletter';
export const LINK_IN_BIO_FLOW = 'link-in-bio';
export const DOMAIN_FIRST_LINK_IN_BIO_FLOW = 'domain-first-link-in-bio';
export const LINK_IN_BIO_POST_SETUP_FLOW = 'link-in-bio-post-setup';
export const VIDEOPRESS_FLOW = 'videopress';
export const IMPORT_FOCUSED_FLOW = 'import-focused';

export const isNewsletterOrLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName &&
			[
				NEWSLETTER_FLOW,
				NEWSLETTER_POST_SETUP_FLOW,
				LINK_IN_BIO_FLOW,
				LINK_IN_BIO_POST_SETUP_FLOW,
				DOMAIN_FIRST_LINK_IN_BIO_FLOW,
			].includes( flowName )
	);
};

export const isTailoredSignupFlow = ( flowName: string | null ) => {
	return Boolean(
		flowName && ( isNewsletterOrLinkInBioFlow( flowName ) || VIDEOPRESS_FLOW === flowName )
	);
};
