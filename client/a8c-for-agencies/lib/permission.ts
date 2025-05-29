import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
} from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import {
	A4A_LANDING_LINK,
	A4A_FEEDBACK_LINK,
	A4A_OVERVIEW_LINK,
	A4A_SITES_LINK,
	A4A_SITES_LINK_NEEDS_ATTENTION,
	A4A_SITES_LINK_NEEDS_SETUP,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_DEVELOPMENT,
	A4A_SITES_LINK_WALKTHROUGH_TOUR,
	A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
	A4A_SITES_CONNECT_URL_LINK,
	A4A_PLUGINS_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK,
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_PURCHASES_LINK,
	A4A_BILLING_LINK,
	A4A_INVOICES_LINK,
	A4A_PAYMENT_METHODS_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
	A4A_TEAM_INVITE_LINK,
	A4A_AGENCY_TIER_LINK,
	A4A_WOOPAYMENTS_LINK,
	A4A_WOOPAYMENTS_DASHBOARD_LINK,
	A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK,
	A4A_WOOPAYMENTS_SITE_SETUP_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
} from '../components/sidebar-menu/lib/constants';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

const A4A_PARTNER_DIRECTORY_DASHBOARD_LINK = `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }`;
const A4A_PARTNER_DIRECTORY_AGENCY_DETAILS_LINK = `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`;
const A4A_PARTNER_DIRECTORY_AGENCY_EXPERTISE_LINK = `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`;

const MEMBER_ACCESSIBLE_PATHS: Record< string, string[] > = {
	[ A4A_SITES_LINK ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_NEEDS_ATTENTION ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_NEEDS_SETUP ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_FAVORITE ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_DEVELOPMENT ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_WALKTHROUGH_TOUR ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_LINK_ADD_NEW_SITE_TOUR ]: [ 'a4a_read_managed_sites' ],
	[ A4A_SITES_CONNECT_URL_LINK ]: [ 'a4a_read_managed_sites' ],
	[ A4A_MARKETPLACE_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_PRODUCTS_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_HOSTING_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_HOSTING_WPCOM_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_CHECKOUT_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_ASSIGN_LICENSE_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK ]: [ 'a4a_read_marketplace' ],
	[ A4A_REFERRALS_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_DASHBOARD ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_PAYMENT_SETTINGS ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_FAQ ]: [ 'a4a_read_referrals' ],
	[ A4A_PARTNER_DIRECTORY_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_DASHBOARD_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_DETAILS_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_EXPERTISE_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PURCHASES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_BILLING_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_INVOICES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_PAYMENT_METHODS_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_PAYMENT_METHODS_ADD_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_MIGRATIONS_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_MIGRATIONS_OVERVIEW_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_MIGRATIONS_COMMISSIONS_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_MIGRATIONS_PAYMENT_SETTINGS ]: [ 'a4a_read_migrations' ],
	[ A4A_TEAM_INVITE_LINK ]: [ 'a4a_edit_user_invites' ],
	[ A4A_AGENCY_TIER_LINK ]: [ 'a4a_read_agency_tier' ],
	[ A4A_PLUGINS_LINK ]: [ 'a4a_read_managed_sites' ],
	// TODO: Add the correct capability for WooPayments
	[ A4A_WOOPAYMENTS_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_WOOPAYMENTS_DASHBOARD_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_WOOPAYMENTS_SITE_SETUP_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_WOOPAYMENTS_OVERVIEW_LINK ]: [ 'a4a_read_referrals' ],
};

const MEMBER_ACCESSIBLE_DYNAMIC_PATHS: Record< string, string[] > = {
	'sites-overview': [ 'a4a_read_managed_sites' ],
	team: [ 'a4a_read_users' ],
	marketplace: [ 'a4a_read_marketplace' ],
	licenses: [ 'a4a_jetpack_licensing' ],
	plugins: [ 'a4a_read_managed_sites' ],
	referrals: [ 'a4a_read_referrals' ],
};

const DYNAMIC_PATH_PATTERNS: Record< string, RegExp > = {
	'sites-overview': /^\/sites\/overview\/[^/]+(\/.*)?$/,
	marketplace: /^\/marketplace\/[^/]+\/[^/]+(\/.*)?$/,
	licenses: /^\/purchases\/licenses(\/.*)?$/,
	team: /^\/team(\/.*)?$/,
	plugins: /^\/plugins(\/.*)?$/,
	referrals: /^\/referrals(\/.*)?$/,
};

export const isPathAllowed = ( pathname: string, agency: Agency | null ) => {
	if ( ! agency ) {
		return false;
	}

	// Everyone can access the landing page and the overview page
	if ( [ A4A_LANDING_LINK, A4A_OVERVIEW_LINK, A4A_FEEDBACK_LINK ].includes( pathname ) ) {
		return true;
	}

	// Check if the user has the required capability to access the current path
	const capabilities = agency?.user?.capabilities;
	if ( capabilities ) {
		const permissions = MEMBER_ACCESSIBLE_PATHS?.[ pathname ];
		if ( permissions ) {
			return capabilities.some( ( capability: string ) => permissions?.includes( capability ) );
		}

		// Check dynamic path patterns
		for ( const [ key, pattern ] of Object.entries( DYNAMIC_PATH_PATTERNS ) ) {
			if ( pattern.test( pathname ) ) {
				const dynamicPermissions = MEMBER_ACCESSIBLE_DYNAMIC_PATHS[ key ];
				return capabilities.some(
					( capability: string ) => dynamicPermissions?.includes( capability )
				);
			}
		}
	}

	return false;
};

const MEMBER_TIER_ACCESSIBLE_PATHS: Record< string, string[] > = {
	[ A4A_PARTNER_DIRECTORY_DASHBOARD_LINK ]: [ 'a4a_feature_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_DETAILS_LINK ]: [ 'a4a_feature_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_EXPERTISE_LINK ]: [ 'a4a_feature_partner_directory' ],
};

export const isPathAllowedForTier = ( pathname: string, agency: Agency | null ) => {
	if ( ! agency ) {
		return false;
	}

	// featureConditions is used to check if the user has access to a specific feature
	// Add the feature name and the condition to enable it according to MEMBER_TIER_ACCESSIBLE_PATHS
	const featureConditions = {
		a4a_feature_partner_directory: agency?.partner_directory.allowed,
	};

	const featuresSet = new Set( agency?.tier?.features || [] );

	// Check if the user has extra capabilities
	for ( const [ feature, condition ] of Object.entries( featureConditions ) ) {
		if ( condition ) {
			featuresSet.add( feature );
		}
	}

	const features = Array.from( featuresSet );

	// Check if the user has the required capability to access the current path
	if ( features ) {
		const permissions = MEMBER_TIER_ACCESSIBLE_PATHS?.[ pathname ];
		if ( permissions ) {
			return features.some( ( capability: string ) => permissions?.includes( capability ) );
		}
	}

	return false;
};
