import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageLoading from '../pages/shared/page-loading';
import useDismissPricingGrid, { PLAN_CHOSEN_QUERY_ARG } from './hooks/use-dismiss-pricing-grid';
import useIsPricingGridEligible from './hooks/use-eligibility';
import type { Callback } from '@automattic/calypso-router';
import type { ReactNode } from 'react';

const PLAN_CHOICE_RETURN_ARGS = [ PLAN_CHOSEN_QUERY_ARG, 'force_refresh' ];

const loadPricingGrid = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-stats-pricing-grid" */ './pricing-grid'
	);

/** `unknown` is what a producer that predates the marker naming the plan sends back. */
type PlanChosenElsewhere = 'free' | 'paid' | 'unknown';

/**
 * Which plan the visitor picked on another surface that asks exactly what this gate asks, or `null`
 * when the site arrived by any other route. Two surfaces send it, both as a query arg on the page
 * they redirect to:
 *
 * - Odyssey’s pre-connection screen, which asks before the site has a blog id to record an answer
 *   against, so the answer has to travel back through the connection flow in the URL.
 * - My Jetpack’s Add Stats interstitial, whose “Start for Free” is the same Free-vs-Paid choice.
 *   It could record the dismissal itself, but saying so in the URL keeps the decision to dismiss
 *   with the dashboard that owns the notice.
 *
 * Remembered after the first read: those args are then stripped from the address bar so they do
 * not sit in the Referer of every dashboard REST request, and the gate remounts on route changes.
 *
 * Exported for tests: too eager and a site never sees the grid, too shy and it is asked twice.
 */
let rememberedPlanChoice: PlanChosenElsewhere | null = null;

function readPlanChoice(): PlanChosenElsewhere | null {
	const marker = new URLSearchParams( window.location.search ).get( PLAN_CHOSEN_QUERY_ARG );

	if ( marker === 'free' || marker === 'paid' ) {
		return marker;
	}

	return marker === '1' ? 'unknown' : null;
}

export function getPlanChosenElsewhere(): PlanChosenElsewhere | null {
	if ( ! rememberedPlanChoice ) {
		rememberedPlanChoice = readPlanChoice();
	}

	return rememberedPlanChoice;
}

export function hasChosenPlanElsewhere(): boolean {
	return getPlanChosenElsewhere() !== null;
}

/** Clears the in-memory plan-chosen flag so tests can set a fresh query string. */
export function resetHasChosenPlanElsewhere() {
	rememberedPlanChoice = null;
}

/**
 * Drops the plan-choice return args from a URL. `force_refresh` in particular is read from the
 * Referer on every Odyssey REST request and bypasses both server caches while it stays in the bar.
 */
export function getUrlWithPlanChoiceReturnArgsRemoved( url: string ): URL {
	const next = new URL( url );

	PLAN_CHOICE_RETURN_ARGS.forEach( ( arg ) => next.searchParams.delete( arg ) );

	return next;
}

function stripPlanChoiceReturnArgsFromCurrentUrl() {
	const current = new URL( window.location.href );

	if ( ! PLAN_CHOICE_RETURN_ARGS.some( ( arg ) => current.searchParams.has( arg ) ) ) {
		return;
	}

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// Odyssey rewrites the URL on load to drop duplicate params; wait for that to finish. The
	// URL is read inside the timeout so a rewrite by another stripper in the same load (the
	// `statsPurchaseSuccess` one) is kept rather than overwritten with a stale copy.
	setTimeout( () => {
		const next = getUrlWithPlanChoiceReturnArgsRemoved( window.location.href );

		window.history.replaceState( null, '', next.toString() );
		if ( isOdysseyStats ) {
			page.base( `${ next.pathname }${ next.search }` );
		}
	}, 300 );
}

// The query arg is gone on the next visit, so the choice has to be recorded server-side once the
// site has an id. Module-scoped rather than a ref: the gate remounts on every route change away
// from and back to the traffic page, and one POST per page load is enough.
let hasRecordedPlanChoice = false;

/**
 * Replaces the Stats dashboard with the pricing grid for newly connected sites
 * that haven't picked a plan yet. Everyone else falls straight through to the
 * dashboard: the connection-date and site-type checks are synchronous against
 * site options, so those sites never wait on the purchase and notice lookups
 * this gate needs before it can decide.
 */
function PricingGridGate( { children }: { children: ReactNode } ) {
	const siteId = useSelector( getSelectedSiteId );
	// Choosing a plan swaps the dashboard in immediately; the server-side dismissal
	// catches up in the background and keeps the grid away on later visits.
	const [ hasChosen, setHasChosen ] = useState( hasChosenPlanElsewhere );
	const dismissPricingGrid = useDismissPricingGrid( siteId );

	const { isEligible, isApplicable, isLoading } = useIsPricingGridEligible( siteId );
	const { data: isVisible, isLoading: isLoadingVisibility } = useNoticeVisibilityQuery(
		siteId,
		'pricing_grid',
		isApplicable
	);

	useEffect( () => {
		stripPlanChoiceReturnArgsFromCurrentUrl();
	}, [] );

	useEffect( () => {
		if ( ! siteId || hasRecordedPlanChoice || ! hasChosenPlanElsewhere() ) {
			return;
		}

		hasRecordedPlanChoice = true;
		dismissPricingGrid();
		// Where the flow that asked elsewhere ends: the site is connected, and this is the first
		// moment the choice made minutes ago can be recorded against a blog id. The event is named
		// for the pre-connection screen it was added for; My Jetpack's interstitial now reports
		// through it too. The property is named for what the marker carries — the plan picked on
		// the grid, not necessarily the one the visitor left with, since taking free from the
		// purchase page returns under the marker the paid choice set. That exit is counted by the
		// purchase page's own button event.
		trackStatsAnalyticsEvent( 'stats_pre_connection_plan_completed', {
			blog_id: siteId,
			plan_chosen: getPlanChosenElsewhere(),
		} );
	}, [ siteId, dismissPricingGrid ] );

	if ( ! isApplicable || hasChosen ) {
		return <>{ children }</>;
	}

	return (
		<>
			<QuerySitePurchases siteId={ siteId } />
			{ ( () => {
				if ( isLoading || isLoadingVisibility ) {
					return PageLoading;
				}
				if ( ! isEligible || ! isVisible ) {
					return children;
				}
				return (
					<>
						<QueryProductsList type="jetpack" />
						<AsyncLoad
							require={ loadPricingGrid }
							placeholder={ PageLoading }
							onDismiss={ () => setHasChosen( true ) }
						/>
					</>
				);
			} )() }
		</>
	);
}

/**
 * Route-controller wrapper: lets the Odyssey routes gate the traffic page
 * without pulling JSX into `routes.ts`.
 */
export function withPricingGridGate( controller: Callback ): Callback {
	return ( context, next ) => {
		controller( context, () => {
			context.primary = <PricingGridGate>{ context.primary }</PricingGridGate>;
			next();
		} );
	};
}

export default PricingGridGate;
