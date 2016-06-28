/**
 * Internal dependencies
 */
var config = require( 'config' ),
	DesignTypeComponent = require( 'signup/steps/design-type' ),
	DomainsStepComponent = require( 'signup/steps/domains' ),
	PaidPlansOnly = require( 'signup/steps/paid-plans-only' ),
	PlansStepComponent = require( 'signup/steps/plans' ),
	SiteComponent = require( 'signup/steps/site' ),
	PressableStoreStepComponent = require( 'signup/steps/pressable-store' ),
	SurveyStepComponent = require( 'signup/steps/survey' ),
	ThemeSelectionComponent = require( 'signup/steps/theme-selection' ),
	UserSignupComponent = require( 'signup/steps/user' );

import PlansFeaturesStep from 'signup/steps/plans-features';

module.exports = {
	'design-type': DesignTypeComponent,
	domains: DomainsStepComponent,
	'domains-with-plan': DomainsStepComponent,
	'domains-only': DomainsStepComponent,
	'jetpack-user': UserSignupComponent,
	plans: PlansStepComponent,
	plansFeatures: PlansFeaturesStep,
	'select-plan': PaidPlansOnly,
	site: SiteComponent,
	'pressable-store': PressableStoreStepComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	themes: ThemeSelectionComponent,
	user: UserSignupComponent
};
