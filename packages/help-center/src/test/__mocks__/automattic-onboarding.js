// Minimal stub for @automattic/onboarding.
// The real package imports @wordpress/react-i18n which crashes in Jest because
// its module-level code calls __() before i18n is initialised.
module.exports = {
	DIFM_FLOW: 'do-it-for-me',
	DIFM_FLOW_STORE: 'do-it-for-me-store',
	HUNDRED_YEAR_DOMAIN_FLOW: 'hundred-year-domain',
	HUNDRED_YEAR_PLAN_FLOW: 'hundred-year-plan',
	WEBSITE_DESIGN_SERVICES: 'website-design-services',
};
