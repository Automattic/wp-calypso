import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
} from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import {
	A4A_LANDING_LINK,
	A4A_OVERVIEW_LINK,
	A4A_SITES_LINK,
	A4A_SITES_LINK_NEEDS_ATTENTION,
	A4A_SITES_LINK_NEEDS_SETUP,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_DEVELOPMENT,
	A4A_SITES_LINK_WALKTHROUGH_TOUR,
	A4A_SITES_LINK_ADD_NEW_SITE_TOUR,
	A4A_SITES_CONNECT_URL_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK,
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_COMMISSIONS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_PURCHASES_LINK,
	A4A_LICENSES_LINK,
	A4A_UNASSIGNED_LICENSES_LINK,
	A4A_BILLING_LINK,
	A4A_INVOICES_LINK,
	A4A_PAYMENT_METHODS_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_TEAM_LINK,
	A4A_TEAM_INVITE_LINK,
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
	[ A4A_REFERRALS_BANK_DETAILS_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_COMMISSIONS_LINK ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_DASHBOARD ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_PAYMENT_SETTINGS ]: [ 'a4a_read_referrals' ],
	[ A4A_REFERRALS_FAQ ]: [ 'a4a_read_referrals' ],
	[ A4A_PARTNER_DIRECTORY_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_DASHBOARD_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_DETAILS_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PARTNER_DIRECTORY_AGENCY_EXPERTISE_LINK ]: [ 'a4a_read_partner_directory' ],
	[ A4A_PURCHASES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_LICENSES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_UNASSIGNED_LICENSES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_BILLING_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_INVOICES_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_PAYMENT_METHODS_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_PAYMENT_METHODS_ADD_LINK ]: [ 'a4a_jetpack_licensing' ],
	[ A4A_MIGRATIONS_LINK ]: [ 'a4a_read_migrations' ],
	[ A4A_TEAM_LINK ]: [ 'a4a_read_users' ],
	[ A4A_TEAM_INVITE_LINK ]: [ 'a4a_edit_user_invites' ],
};

export const isPathAllowed = ( pathname: string, agency: Agency | null ) => {
	if ( ! agency ) {
		return false;
	}

	// Admins can access all paths
	const role = agency?.user?.role;
	// For some cases, the role isn't set, so we default to 'a4a_administrator'
	// FIXME: This should be removed after the role is set for all users
	if ( ! role || role === 'a4a_administrator' ) {
		return true;
	}

	// Everyone can access the landing page and the overview page
	if ( [ A4A_LANDING_LINK, A4A_OVERVIEW_LINK ].includes( pathname ) ) {
		return true;
	}

	// Check if the user has the required capability to access the current path
	const capabilities = agency?.user?.capabilities;
	if ( capabilities ) {
		const permissions = MEMBER_ACCESSIBLE_PATHS?.[ pathname ];
		return permissions
			? capabilities.some( ( capability: string ) => permissions.includes( capability ) )
			: false;
	}
};
