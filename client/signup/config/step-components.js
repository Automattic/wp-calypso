/**
 * Internal dependencies
 */
var UserSignupComponent = require( 'signup/steps/user' ),
	SiteComponent = require( 'signup/steps/site' ),
	ThemeSelectionComponent = require( 'signup/steps/theme-selection' ),
	PlansStepComponent = require( 'signup/steps/plans' ),
	DomainsStepComponent = require( 'signup/steps/domains' ),
	DesignTypeComponent = require( 'signup/steps/design-type' ),
	SurveyStepComponent = require( 'signup/steps/survey' ),
	config = require( 'config' );

module.exports = {
	themes: ThemeSelectionComponent,
	'theme-headstart': ThemeSelectionComponent,
	site: SiteComponent,
	user: UserSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	plans: PlansStepComponent,
	domains: DomainsStepComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	'domains-with-theme': DomainsStepComponent,
	'design-type': DesignTypeComponent,
	'jetpack-user': UserSignupComponent
};
