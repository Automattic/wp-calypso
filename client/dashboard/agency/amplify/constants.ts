import { __ } from '@wordpress/i18n';
import { ALL_TIERS } from '../tiers/constants';
import type { AgencyTierId } from '@automattic/api-core';

/**
 * Working feature name. "Amplify" is being retired in favour of a name that
 * says what the tool does (A4A-3403). Keep every user-facing reference pointed
 * here so the final rename is a one-line change.
 */
export const getFeatureName = () => __( 'Prospect reports' );

/** The page description under the title, in both dashboards. */
export const getFeatureDescription = () =>
	__(
		'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fixes.'
	);

/** Query param that opens the New report modal when the page loads, e.g. `/prospect-reports?new-report=1`. */
export const NEW_REPORT_PARAM = 'new-report';

/** Timing copy used everywhere, per the v1 PRD. */
export const getReportTiming = () => __( '10 to 20 minutes' );

const getTierName = ( tierId: AgencyTierId ) =>
	ALL_TIERS.find( ( tier ) => tier.id === tierId )?.name ?? '';

/**
 * Monthly scan allowances by tier (PRD: "Monthly scan allowances by tier").
 * The API's `usage.limit` is the source of truth; this table only powers the
 * explainer so agencies can see what the next tier unlocks.
 */
export const getTierAllowances = (): { label: string; scans: number; tiers: AgencyTierId[] }[] => [
	{
		label: getTierName( 'emerging-partner' ),
		scans: getReportAllowance( 'emerging-partner' ),
		tiers: [ 'emerging-partner' ],
	},
	{
		label: getTierName( 'agency-partner' ),
		scans: getReportAllowance( 'agency-partner' ),
		tiers: [ 'agency-partner' ],
	},
	{
		label: getTierName( 'pro-agency-partner' ),
		scans: getReportAllowance( 'pro-agency-partner' ),
		tiers: [ 'pro-agency-partner' ],
	},
	{
		// One row for two tiers, so it has its own shorter name.
		label: __( 'VIP Pro & Premier' ),
		scans: getReportAllowance( 'vip-pro-agency-partner' ),
		tiers: [ 'vip-pro-agency-partner', 'premier-partner' ],
	},
];

/**
 * The tier's monthly Prospect reports allowance. The Tiers constants call this
 * while building `ALL_TIERS`, so it can't depend on `ALL_TIERS` itself.
 */
export function getReportAllowance( tierId: AgencyTierId ) {
	const allowances: Record< AgencyTierId, number > = {
		'emerging-partner': 5,
		'agency-partner': 15,
		'pro-agency-partner': 30,
		'vip-pro-agency-partner': 60,
		'premier-partner': 60,
	};
	return allowances[ tierId ] ?? 0;
}

/** Agency Partner and above get "Need more? Contact us" at the cap. */
const CONTACT_TIERS: AgencyTierId[] = [
	'agency-partner',
	'pro-agency-partner',
	'vip-pro-agency-partner',
	'premier-partner',
];

export function canContactForMoreScans( tierId?: AgencyTierId ) {
	return !! tierId && CONTACT_TIERS.includes( tierId );
}
