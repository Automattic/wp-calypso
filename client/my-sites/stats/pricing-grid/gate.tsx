import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageLoading from '../pages/shared/page-loading';
import useDismissPricingGrid, { PLAN_CHOSEN_QUERY_ARG } from './hooks/use-dismiss-pricing-grid';
import useIsPricingGridEligible from './hooks/use-eligibility';
import type { Callback } from '@automattic/calypso-router';
import type { ReactNode } from 'react';

const PRE_CONNECTION_RETURN_ARGS = [ PLAN_CHOSEN_QUERY_ARG, 'force_refresh' ];

const loadPricingGrid = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-stats-pricing-grid" */ './pricing-grid'
	);

/**
 * Whether the visitor already answered the plan question on Odyssey's pre-connection screen, which
 * asks exactly what this gate asks — but before the site had a blog id to record the answer
 * against, so the answer travels back as a query arg on the page the connection flow lands on.
 *
 * Remembered after the first read: those args are then stripped from the address bar so they do
 * not sit in the Referer of every dashboard REST request, and the gate remounts on route changes.
 *
 * Exported for tests: too eager and a site never sees the grid, too shy and it is asked twice.
 */
let rememberedChoiceBeforeConnecting = false;

export function hasChosenBeforeConnecting(): boolean {
	if ( rememberedChoiceBeforeConnecting ) {
		return true;
	}

	rememberedChoiceBeforeConnecting =
		new URLSearchParams( window.location.search ).get( PLAN_CHOSEN_QUERY_ARG ) === '1';

	return rememberedChoiceBeforeConnecting;
}

/** Clears the in-memory plan-chosen flag so tests can set a fresh query string. */
export function resetHasChosenBeforeConnecting() {
	rememberedChoiceBeforeConnecting = false;
}

/**
 * Drops the pre-connection return args from a URL. `force_refresh` in particular is read from the
 * Referer on every Odyssey REST request and bypasses both server caches while it stays in the bar.
 */
export function getUrlWithPreConnectionReturnArgsRemoved( url: string ): URL {
	const next = new URL( url );

	PRE_CONNECTION_RETURN_ARGS.forEach( ( arg ) => next.searchParams.delete( arg ) );

	return next;
}

function stripPreConnectionReturnArgsFromCurrentUrl() {
	const current = new URL( window.location.href );

	if ( ! PRE_CONNECTION_RETURN_ARGS.some( ( arg ) => current.searchParams.has( arg ) ) ) {
		return;
	}

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// Odyssey rewrites the URL on load to drop duplicate params; wait for that to finish. The
	// URL is read inside the timeout so a rewrite by another stripper in the same load (the
	// `statsPurchaseSuccess` one) is kept rather than overwritten with a stale copy.
	setTimeout( () => {
		const next = getUrlWithPreConnectionReturnArgsRemoved( window.location.href );

		window.history.replaceState( null, '', next.toString() );
		if ( isOdysseyStats ) {
			page.base( `${ next.pathname }${ next.search }` );
		}
	}, 300 );
}

// The query arg is gone on the next visit, so the choice has to be recorded server-side once the
// site finally has an id. Module-scoped rather than a ref: the gate remounts on every route change
// away from and back to the traffic page, and one POST per page load is enough.
let hasRecordedChoiceBeforeConnecting = false;

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
	const [ hasChosen, setHasChosen ] = useState( hasChosenBeforeConnecting );
	const dismissPricingGrid = useDismissPricingGrid( siteId );

	const { isEligible, isApplicable, isLoading } = useIsPricingGridEligible( siteId );
	const { data: isVisible, isLoading: isLoadingVisibility } = useNoticeVisibilityQuery(
		siteId,
		'pricing_grid',
		isApplicable
	);

	useEffect( () => {
		stripPreConnectionReturnArgsFromCurrentUrl();
	}, [] );

	useEffect( () => {
		if ( ! siteId || hasRecordedChoiceBeforeConnecting || ! hasChosenBeforeConnecting() ) {
			return;
		}

		hasRecordedChoiceBeforeConnecting = true;
		dismissPricingGrid();
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
