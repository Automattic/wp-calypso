import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import useStatsPurchases from '../../hooks/use-stats-purchases';

/**
 * Sites connected before the pricing grid shipped were never offered this choice, so
 * showing it to them now would be a regression rather than onboarding.
 */
const LAUNCH_DATE = Date.parse( '2026-08-07T00:00:00Z' );

/**
 * Whether the pricing grid applies to this site: a newly connected site that hasn't
 * picked a Stats plan yet. Bundled plans (Complete, Growth, Business) count as having
 * one, which is why this defers to `useStatsPurchases` rather than scanning products.
 */
export default function useIsPricingGridEligible( siteId: number | null ) {
	const { hasAnyPlan, isLoading: isLoadingPurchases } = useStatsPurchases( siteId );

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

	return {
		isEligible: isNewConnection && ! hasAnyPlan,
		isNewConnection,
		// The date check needs no fetch, so only newly connected sites ever wait.
		isLoading: isNewConnection && isLoadingPurchases,
	};
}
