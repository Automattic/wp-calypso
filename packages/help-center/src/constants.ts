export const SUPPORT_BLOG_ID = 9619154;
import {
	DIFM_FLOW,
	DIFM_FLOW_STORE,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	WEBSITE_DESIGN_SERVICES,
} from '@automattic/onboarding';
/**
 * Customizer: Mapping from Calypso panel slug to tuple of focus key and value.
 */
export const PANEL_MAPPINGS: Record< string, [ string, string ] > = {
	widgets: [ 'panel', 'widgets' ],
	fonts: [ 'section', 'jetpack_fonts' ],
	identity: [ 'section', 'title_tagline' ],
	'custom-css': [ 'section', 'jetpack_custom_css' ],
	amp: [ 'section', 'amp_design' ],
	menus: [ 'panel', 'nav_menus' ],
	homepage: [ 'section', 'static_front_page' ],
	jetpack_search: [ 'section', 'jetpack_search' ],
};

export const EMAIL_SUPPORT_LOCALES = [
	'en',
	'en-gb',
	'de',
	'de-at',
	'de-li',
	'de-lu',
	'de-ch',
	'es',
	'es-cl',
	'es-mx',
	'fr',
	'fr-ca',
	'fr-be',
	'fr-ch',
	'it',
	'it-ch',
	'ja',
	'nl',
	'nl-be',
	'nl-nl',
	'pt',
	'pt-pt',
	'pt-br',
	'sv',
	'sv-fi',
	'sv-se',
];

export const FLOWS_ZENDESK_INITIAL_MESSAGES = {
	[ DIFM_FLOW ]: 'User is purchasing DIFM plan.',
	[ DIFM_FLOW_STORE ]: 'User is purchasing DIFM store plan.',
	[ WEBSITE_DESIGN_SERVICES ]: 'User is purchasing DIFM website design services.',
	[ HUNDRED_YEAR_PLAN_FLOW ]: 'User is purchasing 100 year plan.',
	[ HUNDRED_YEAR_DOMAIN_FLOW ]: 'User is purchasing 100 year domain.',
};

export const FLOWS_ZENDESK_FLOWNAME = {
	[ DIFM_FLOW ]: 'messaging_flow_dotcom_difm',
	[ DIFM_FLOW_STORE ]: 'messaging_flow_dotcom_difm',
	[ WEBSITE_DESIGN_SERVICES ]: 'messaging_flow_dotcom_difm',
	[ HUNDRED_YEAR_PLAN_FLOW ]: 'messaging_flow_dotcom_100_year_plan',
	[ HUNDRED_YEAR_DOMAIN_FLOW ]: 'messaging_flow_dotcom_100_year_domain',
};
