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
		'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fix.'
	);

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
	{ label: getTierName( 'emerging-partner' ), scans: 5, tiers: [ 'emerging-partner' ] },
	{ label: getTierName( 'agency-partner' ), scans: 15, tiers: [ 'agency-partner' ] },
	{ label: getTierName( 'pro-agency-partner' ), scans: 30, tiers: [ 'pro-agency-partner' ] },
	{
		// One row for two tiers, so it has its own shorter name.
		label: __( 'VIP Pro & Premier' ),
		scans: 60,
		tiers: [ 'vip-pro-agency-partner', 'premier-partner' ],
	},
];

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
