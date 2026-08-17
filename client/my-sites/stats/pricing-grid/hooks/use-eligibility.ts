import { useSelector } from 'calypso/state';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import { getSiteOption, isWpcomSite } from 'calypso/state/sites/selectors';
import useStatsPurchases from '../../hooks/use-stats-purchases';

/**
 * Sites connected before the pricing grid shipped were never offered this choice, so
 * showing it to them now would be a regression rather than onboarding.
 */
const LAUNCH_DATE = Date.parse( '2026-08-07T00:00:00Z' );

/**
 * Whether the pricing grid applies to this site: a newly connected site, other than a
 * WordPress.com one, that hasn't picked a Stats plan yet. Bundled plans (Complete,
 * Growth, Business) count as having one, which is why this defers to
 * `useStatsPurchases` rather than scanning products.
 */
export default function useIsPricingGridEligible( siteId: number | null ) {
	const { hasAnyPlan, isLoading: isLoadingPurchases } = useStatsPurchases( siteId );

	// WordPress.com sites — Simple and Atomic alike — upgrade through WP.com plans, prompted
	// inside the Stats dashboard itself, so the Jetpack Stats products this grid sells are
	// not their upgrade path. Odyssey serves their wp-admin as well, so being an Odyssey
	// route says nothing about the site type on its own.
	const isWpcom = useSelector( ( state ) => !! isWpcomSite( state, siteId ) );

	// A failed purchases fetch reads as "loaded, no plan" upstream (FETCH_FAILED marks
	// the store loaded with an empty list), which would show the grid to a site that
	// does hold a plan. Treat the error as "plan state unknown" and fall back to the
	// dashboard instead. The field is shared across all purchases actions (user-level
	// fetches and removals set it too, and it only clears on the next successful
	// fetch), so this occasionally withholds the grid on an unrelated error — still
	// fail-closed, never the reverse.
	const purchasesError = useSelector( getPurchasesError );

	// `created_at` is the wpcom shadow blog's `wp_blogs.registered` — the closest thing
	// to a first-connection date the sites payload exposes. It matches the connection
	// moment when registration created the row, but a reused pre-existing row keeps its
	// older date and reconnects never update it, so this check can only withhold the
	// grid from a genuinely new connection — never show it to an established site.
	const connectedAt = useSelector( ( state ) => getSiteOption( state, siteId, 'created_at' ) );

	// The API serves dates both as unix seconds and as ISO strings depending on the
	// field; accept either rather than betting on one and silently never matching.
	const connectedAtMs =
		typeof connectedAt === 'number'
			? connectedAt * 1000
			: Date.parse( String( connectedAt ?? '' ) );
	const isNewConnection = Number.isFinite( connectedAtMs ) && connectedAtMs >= LAUNCH_DATE;

	// Both checks read site data the store already holds, so ruling a site out here costs
	// nothing — only an applicable site goes on to wait for its purchases.
	const isApplicable = isNewConnection && ! isWpcom;

	return {
		isEligible: isApplicable && ! hasAnyPlan && ! purchasesError,
		isApplicable,
		isLoading: isApplicable && isLoadingPurchases,
	};
}
