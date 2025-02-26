// IMPORTANT: We need to make sure that we update
// the 'calypso/a8c-for-agencies/lib/permission.ts' file
// to include the necessary permissions for the new routes.
export const A4A_LANDING_LINK = '/landing';
export const A4A_OVERVIEW_LINK = '/overview';
export const A4A_SITES_LINK = '/sites';
export const A4A_SITES_LINK_NEEDS_ATTENTION = '/sites?issue_types=all_issues';
export const A4A_SITES_LINK_NEEDS_SETUP = '/sites/need-setup';
export const A4A_SITES_LINK_FAVORITE = '/sites?is_favorite';
export const A4A_SITES_LINK_DEVELOPMENT = '/sites?is_development';
export const A4A_SITES_LINK_WALKTHROUGH_TOUR = `${ A4A_SITES_LINK }?tour=sites-walkthrough`;
export const A4A_SITES_LINK_ADD_NEW_SITE_TOUR = '/sites?tour=add-new-site';
export const A4A_SITES_CONNECT_URL_LINK = '/sites/connect-url';
export const A4A_PLUGINS_LINK = '/plugins';
export const A4A_MARKETPLACE_LINK = '/marketplace';
export const A4A_MARKETPLACE_PRODUCTS_LINK = `${ A4A_MARKETPLACE_LINK }/products`;
export const A4A_MARKETPLACE_HOSTING_LINK = `${ A4A_MARKETPLACE_LINK }/hosting`;
export const A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK = `${ A4A_MARKETPLACE_HOSTING_LINK }/pressable`;
export const A4A_MARKETPLACE_HOSTING_WPCOM_LINK = `${ A4A_MARKETPLACE_HOSTING_LINK }/wpcom`;
export const A4A_MARKETPLACE_CHECKOUT_LINK = `${ A4A_MARKETPLACE_LINK }/checkout`;
export const A4A_MARKETPLACE_ASSIGN_LICENSE_LINK = `${ A4A_MARKETPLACE_LINK }/assign-license`;
export const A4A_PURCHASES_LINK = '/purchases';
export const A4A_REFERRALS_LINK = '/referrals';
export const A4A_REFERRALS_BANK_DETAILS_LINK = '/referrals/bank-details';
export const A4A_REFERRALS_COMMISSIONS_LINK = '/referrals/commissions';
export const A4A_REFERRALS_DASHBOARD = `${ A4A_REFERRALS_LINK }/dashboard`;
export const A4A_REFERRALS_PAYMENT_SETTINGS = `${ A4A_REFERRALS_LINK }/payment-settings`;
export const A4A_REFERRALS_FAQ = `${ A4A_REFERRALS_LINK }/faq`;
export const A4A_REFERRALS_ARCHIVED = `${ A4A_REFERRALS_LINK }/archived`;
export const A4A_LICENSES_LINK = `${ A4A_PURCHASES_LINK }/licenses`;
export const A4A_UNASSIGNED_LICENSES_LINK = `${ A4A_LICENSES_LINK }/unassigned`;
export const A4A_BILLING_LINK = `${ A4A_PURCHASES_LINK }/billing`;
export const A4A_INVOICES_LINK = `${ A4A_PURCHASES_LINK }/invoices`;
export const A4A_PAYMENT_METHODS_LINK = `${ A4A_PURCHASES_LINK }/payment-methods`;
export const A4A_PAYMENT_METHODS_ADD_LINK = `${ A4A_PURCHASES_LINK }/payment-methods/add`;
export const A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK = `${ A4A_MARKETPLACE_LINK }/download-products`;
export const A4A_SIGNUP_LINK = '/signup';
export const A4A_SIGNUP_FINISH_LINK = '/signup/finish';
export const A4A_MIGRATIONS_LINK = '/migrations';
export const A4A_MIGRATIONS_OVERVIEW_LINK = `${ A4A_MIGRATIONS_LINK }/overview`;
export const A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK = `${ A4A_MIGRATIONS_OVERVIEW_LINK }/migrate-to-pressable`;
export const A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK = `${ A4A_MIGRATIONS_OVERVIEW_LINK }/migrate-to-wpcom`;
export const A4A_MIGRATIONS_COMMISSIONS_LINK = `${ A4A_MIGRATIONS_LINK }/commissions`;
export const A4A_MIGRATIONS_PAYMENT_SETTINGS = `${ A4A_MIGRATIONS_LINK }/payment-settings`;
export const A4A_SETTINGS_LINK = '/settings';
export const A4A_PARTNER_DIRECTORY_LINK = '/partner-directory';
export const A4A_PARTNER_DIRECTORY_DASHBOARD_LINK = `${ A4A_PARTNER_DIRECTORY_LINK }/dashboard`;
export const A4A_TEAM_LINK = '/team';
export const A4A_TEAM_INVITE_LINK = '/team/invite';
export const A4A_TEAM_ACCEPT_INVITE_LINK = '/team/invite/accept';
export const EXTERNAL_A4A_KNOWLEDGE_BASE = 'http://automattic.com/for-agencies/help';
export const A4A_AGENCY_TIER_LINK = '/agency-tier';
export const A4A_WOOPAYMENTS_LINK = '/woopayments';
export const A4A_WOOPAYMENTS_DASHBOARD_LINK = `${ A4A_WOOPAYMENTS_LINK }/dashboard`;
export const A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK = `${ A4A_WOOPAYMENTS_LINK }/payment-settings`;

// Client
export const A4A_CLIENT_LANDING_LINK = '/client/landing';
export const A4A_CLIENT_SUBSCRIPTIONS_LINK = '/client/subscriptions';
export const A4A_CLIENT_PAYMENT_METHODS_LINK = '/client/payment-methods';
export const A4A_CLIENT_INVOICES_LINK = '/client/invoices';
export const A4A_CLIENT_PAYMENT_METHODS_ADD_LINK = `${ A4A_CLIENT_PAYMENT_METHODS_LINK }/add`;
export const A4A_CLIENT_CHECKOUT = '/client/checkout';
export const EXTERNAL_A4A_CLIENT_KNOWLEDGE_BASE =
	'https://agencieshelp.automattic.com/knowledge-base/client-billing/';
export const EXTERNAL_WPCOM_ACCOUNT_URL = 'https://wordpress.com/me/';
