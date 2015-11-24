/**
 * Internal dependencies
 */
var EmailSignupComponent = require( 'signup/steps/email-signup-form' ),
	SiteCreationComponent = require( 'signup/steps/site-creation' ),
	ThemeSelectionComponent = require( 'signup/steps/theme-selection' ),
	PlansStepComponent = require( 'signup/steps/plans' ),
	DomainsStepComponent = require( 'signup/steps/domains' ),
	DSSStepComponent = require( 'signup/steps/dss' ),
	config = require( 'config' );

module.exports = {
	themes: ThemeSelectionComponent,
	'theme-headstart': ThemeSelectionComponent,
	site: SiteCreationComponent,
	user: EmailSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	plans: PlansStepComponent,
	domains: DomainsStepComponent,
	'domains-with-theme': DomainsStepComponent,
	'theme-dss': DSSStepComponent,
	'jetpack-user': EmailSignupComponent
};
