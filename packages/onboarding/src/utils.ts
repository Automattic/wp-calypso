export const isNewsletterOrLinkInBioFlow = ( flowName: string ) => {
	return [ 'newsletter', 'link-in-bio' ].includes( flowName );
};
