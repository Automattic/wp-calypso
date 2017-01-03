/**
 * Internal dependencies
 */
var config = require( 'config' ),
	DesignTypeComponent = require( 'signup/steps/design-type' ),
	DesignTypeWithStoreComponent = require( 'signup/steps/design-type-with-store' ),
	DomainsStepComponent = require( 'signup/steps/domains' ),
	GetDotBlogPlansStepComponent = require( 'signup/steps/get-dot-blog-plans' ),
	PlansStepComponent = require( 'signup/steps/plans' ),
	SiteComponent = require( 'signup/steps/site' ),
	SiteTitleComponent = require( 'signup/steps/site-title' ),
	SurveyStepComponent = require( 'signup/steps/survey' ),
	ThemeSelectionComponent = require( 'signup/steps/theme-selection' ),
	UserSignupComponent = require( 'signup/steps/user' );

module.exports = {
	'design-type': DesignTypeComponent,
	'design-type-with-store': DesignTypeWithStoreComponent,
	domains: DomainsStepComponent,
	'domains-with-plan': DomainsStepComponent,
	'domain-only': DomainsStepComponent,
	'domains-theme-preselected': DomainsStepComponent,
	'jetpack-user': UserSignupComponent,
	'get-dot-blog-plans': GetDotBlogPlansStepComponent,
	'get-dot-blog-themes': ThemeSelectionComponent,
	plans: PlansStepComponent,
	site: SiteComponent,
	'site-title': SiteTitleComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	themes: ThemeSelectionComponent,
	user: UserSignupComponent
};
