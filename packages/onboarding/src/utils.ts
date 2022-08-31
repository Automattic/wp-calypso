export const NEWSLETTER_FLOW = 'newsletter';
export const LINK_IN_BIO_FLOW = 'link-in-bio';

export const isNewsletterOrLinkInBioFlow = ( flowName: string | null ) => {
	return Boolean( flowName && [ NEWSLETTER_FLOW, LINK_IN_BIO_FLOW ].includes( flowName ) );
};
