import { __ } from '@wordpress/i18n';
import type { AgencyTierId } from '@automattic/api-core';

/**
 * Working feature name. "Amplify" is being retired in favour of a name that
 * says what the tool does (A4A-3403). Keep every user-facing reference pointed
 * here so the final rename is a one-line change.
 */
export const getFeatureName = () => __( 'Prospect reports' );

/** Timing copy used everywhere, per the v1 PRD. */
export const getReportTiming = () => __( '10 to 20 minutes' );

/**
 * Monthly scan allowances by tier (PRD: "Monthly scan allowances by tier").
 * The API's `usage.limit` is the source of truth; this table only powers the
 * explainer so agencies can see what the next tier unlocks.
 */
export const getTierAllowances = (): { label: string; scans: number }[] => [
	{ label: __( 'Account Activated' ), scans: 5 },
	{ label: __( 'Agency Partner' ), scans: 15 },
	{ label: __( 'Pro Agency Partner' ), scans: 30 },
	{ label: __( 'VIP Pro & Premier' ), scans: 60 },
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
