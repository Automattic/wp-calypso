/**
 * Internal dependencies
 */
var UserSignupComponent = require( 'signup/steps/user' ),
	SiteComponent = require( 'signup/steps/site' ),
	ThemeSelectionComponent = require( 'signup/steps/theme-selection' ),
	PaidPlansWithFreeTrials = require( 'signup/steps/paid-plans-with-free-trials' ),
	PlansStepComponent = require( 'signup/steps/plans' ),
	DomainsStepComponent = require( 'signup/steps/domains' ),
	DesignTypeComponent = require( 'signup/steps/design-type' ),
	SurveyStepComponent = require( 'signup/steps/survey' ),
	config = require( 'config' );

module.exports = {
	themes: ThemeSelectionComponent,
	site: SiteComponent,
	user: UserSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	plans: PlansStepComponent,
	'select-plan': PaidPlansWithFreeTrials,
	domains: DomainsStepComponent,
	survey: SurveyStepComponent,
	'design-type': DesignTypeComponent,
	'themes-headstart': ThemeSelectionComponent,
	'domains-with-theme': DomainsStepComponent,
	'jetpack-user': UserSignupComponent
};
