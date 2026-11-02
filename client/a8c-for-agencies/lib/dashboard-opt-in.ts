import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import {
	A4A_AGENCY_TIER_LINK,
	A4A_AI_MCP_CONNECT_LINK,
	A4A_AI_MCP_LINK,
	A4A_AI_MCP_READ_TOOLS_LINK,
	A4A_AI_MCP_STARTER_PROMPTS_LINK,
	A4A_AI_MCP_WRITE_TOOLS_LINK,
	A4A_AMPLIFY_LINK,
	A4A_DEV_TOOLS_LINK,
	A4A_EXCLUSIVE_OFFERS_LINK,
	A4A_LEARN_LINK,
	A4A_LICENSES_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
	A4A_OVERVIEW_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_PURCHASES_LINK,
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_RESOURCES_LINK,
	A4A_SITES_LINK,
	A4A_TEAM_LINK,
	A4A_WOOPAYMENTS_LINK,
	A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK,
	A4A_WOOPAYMENTS_SITE_SETUP_LINK,
} from '../components/sidebar-menu/lib/constants';
import { A4A_REPORTS_LINK } from '../sections/reports/constants';
import {
	HOSTING_OVERVIEW_ID,
	JETPACK_ACTIVITY_ID,
	JETPACK_BACKUP_ID,
	JETPACK_MONITOR_ID,
	JETPACK_PERFORMANCE_ID,
	JETPACK_SCAN_ID,
} from '../sections/sites/features/features';

type Query = Record< string, string | undefined >;

// `rest` is the path segments after the matched prefix. `null` keeps the page here.
type Target = string | null | ( ( rest: string[], query: Query ) => string | null );

const SITE_FEATURE_PATHS: Record< string, string > = {
	[ HOSTING_OVERVIEW_ID ]: '',
	[ JETPACK_BACKUP_ID ]: '/backups',
	[ JETPACK_SCAN_ID ]: '/scan',
	[ JETPACK_ACTIVITY_ID ]: '/logs/activity',
	[ JETPACK_MONITOR_ID ]: '/monitoring',
	[ JETPACK_PERFORMANCE_ID ]: '/performance',
};

/**
 * Pages of this app and their Multi-site Dashboard counterparts. The first prefix that
 * matches wins, so more specific prefixes come first.
 */
const DASHBOARD_PATHS: [ string, Target ][] = [
	// The Multi-site Dashboard has no home for these yet.
	[ A4A_AMPLIFY_LINK, null ],
	[ A4A_REPORTS_LINK, null ],

	[ A4A_OVERVIEW_LINK, '/overview' ],
	[ A4A_EXCLUSIVE_OFFERS_LINK, '/exclusive-offers' ],
	[ A4A_AGENCY_TIER_LINK, '/tiers' ],
	[ A4A_TEAM_LINK, '/agency/team' ],

	// `/sites/:category/:siteUrl/:feature`
	[
		A4A_SITES_LINK,
		( [ category, siteUrl, feature ] ) => {
			if ( ! category || category === 'add' || ! siteUrl ) {
				return '/sites';
			}
			return `/sites/${ siteUrl }${ SITE_FEATURE_PATHS[ feature ?? HOSTING_OVERVIEW_ID ] ?? '' }`;
		},
	],

	[ A4A_MARKETPLACE_PRODUCTS_LINK, '/products' ],
	[
		A4A_MARKETPLACE_HOSTING_LINK,
		( [ section ] ) => ( section ? `/hosting/${ section }` : '/hosting' ),
	],
	[
		A4A_MARKETPLACE_CHECKOUT_LINK,
		( rest, query ) =>
			! rest.length && query.referral_blog_id
				? `/referral-checkout?referral_blog_id=${ encodeURIComponent( query.referral_blog_id ) }`
				: null,
	],
	// Checkout, license assignment and downloads run on the cart here.
	[ A4A_MARKETPLACE_LINK, ( rest ) => ( rest.length ? null : '/marketplace' ) ],

	[ A4A_LICENSES_LINK, '/purchases' ],
	// Invoices, payment methods and billing have no counterpart yet.
	[ A4A_PURCHASES_LINK, ( rest ) => ( rest.length ? null : '/purchases' ) ],

	[ A4A_REFERRALS_PAYMENT_SETTINGS, '/payout-settings' ],
	[ A4A_MIGRATIONS_PAYMENT_SETTINGS, '/payout-settings' ],
	[ A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK, '/payout-settings' ],
	[
		A4A_WOOPAYMENTS_SITE_SETUP_LINK,
		( rest, query ) =>
			query.site_id
				? `/woopayments/setup/${ encodeURIComponent( query.site_id ) }`
				: '/woopayments',
	],
	[ A4A_REFERRALS_LINK, '/referrals' ],
	[ A4A_MIGRATIONS_LINK, '/migrations' ],
	[ A4A_WOOPAYMENTS_LINK, '/woopayments' ],

	[ `${ A4A_PARTNER_DIRECTORY_LINK }/agency-expertise`, '/partner-directory/expertise' ],
	[ `${ A4A_PARTNER_DIRECTORY_LINK }/agency-details`, '/partner-directory/details' ],
	[ `${ A4A_PARTNER_DIRECTORY_LINK }/lead-matching`, '/partner-directory/lead-matching' ],
	[ A4A_PARTNER_DIRECTORY_LINK, '/partner-directory' ],

	[ A4A_LEARN_LINK, '/library' ],
	[ A4A_DEV_TOOLS_LINK, '/dev-tools' ],
	[ A4A_AI_MCP_READ_TOOLS_LINK, '/agency/ai/read' ],
	[ A4A_AI_MCP_WRITE_TOOLS_LINK, '/agency/ai/write' ],
	[ A4A_AI_MCP_CONNECT_LINK, '/agency/ai/connect' ],
	[ A4A_AI_MCP_STARTER_PROMPTS_LINK, '/agency/ai/prompts' ],
	[ A4A_AI_MCP_LINK, '/agency/ai' ],
	[ A4A_RESOURCES_LINK, ( rest ) => ( rest.length ? null : '/library' ) ],
];

/**
 * Returns the Multi-site Dashboard path for a page of this app, or null when
 * the page has no counterpart there and should stay here.
 */
export function getDashboardPath( pathname: string, query: Query = {} ): string | null {
	const path = pathname.replace( /\/+$/, '' ) || '/';

	for ( const [ prefix, target ] of DASHBOARD_PATHS ) {
		if ( path === prefix || path.startsWith( prefix + '/' ) ) {
			const rest = path.slice( prefix.length ).split( '/' ).filter( Boolean );
			return typeof target === 'function' ? target( rest, query ) : target;
		}
	}

	return null;
}

/**
 * Returns the full Multi-site Dashboard URL for a page of this app, or null
 * when the page should stay here.
 */
export function getDashboardUrl( pathname: string, query: Query = {} ): string | null {
	const path = getDashboardPath( pathname, query );
	return path === null ? null : buildDashboardLink( 'a4a', path );
}
