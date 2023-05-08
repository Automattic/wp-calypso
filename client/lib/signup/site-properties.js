import i18n from 'i18n-calypso';

const sitePropertiesDefaults = {
	// General copy
	siteMockupHelpTipCopy: i18n.translate(
		"Scroll down to see how your site will look. You can customize it with your own text and photos when we're done with the setup basics."
	),
	siteMockupHelpTipCopyBottom: i18n.translate( 'Scroll back up to continue.' ),
	siteMockupTitleFallback: i18n.translate( 'Your New Website' ),
	// Site title step
	siteTitleLabel: i18n.translate( 'Give your site a name' ),
	siteTitleSubheader: i18n.translate(
		'This will appear at the top of your site and can be changed at anytime.'
	),
	siteTitlePlaceholder: i18n.translate( "E.g., Vail Renovations or Stevie's blog" ),
	// Domains step
	signUpFlowDomainsStepHeader: i18n.translate( "Let's get your site a domain!" ),
	signUpFlowDomainsStepSubheader: i18n.translate(
		"Tell us your site's name or a few keywords, and we'll come up with some suggestions."
	),
};

export const getSitePropertyDefaults = ( propertyKey ) =>
	sitePropertiesDefaults[ propertyKey ] ?? null;
