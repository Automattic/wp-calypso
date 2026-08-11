import config from '@automattic/calypso-config';
import { useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageLoading from '../pages/shared/page-loading';
import useIsPricingGridEligible from './hooks/use-eligibility';
import type { Callback } from '@automattic/calypso-router';
import type { ReactNode } from 'react';

const loadPricingGrid = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-stats-pricing-grid" */ './pricing-grid'
	);

/**
 * Whether the visitor already picked a plan on the pre-connection pricing screen, which asks
 * the same question this grid does. Recorded on the site rather than on WordPress.com,
 * because the choice is made before the site has a blog ID to key it against. A site
 * connected by any other route never sets it, so it still gets the grid.
 *
 * Read defensively: the key ships with every Odyssey screen, but `config()` throws on an
 * unknown key in development builds and this component lives in shared Calypso code.
 *
 * Exported for tests: it is the whole suppression rule, and getting it wrong in either
 * direction is costly — too eager and a site never sees the grid, too shy and a visitor is
 * asked to pick a plan twice.
 */
export function hasChosenBeforeConnecting(): boolean {
	try {
		return !! config( 'stats_pricing_choice_recorded' );
	} catch {
		return false;
	}
}

/**
 * Replaces the Stats dashboard with the pricing grid for newly connected sites
 * that haven't picked a plan yet. Everyone else falls straight through to the
 * dashboard: the connection-date check is synchronous against site options, so
 * established sites never wait on the purchase and notice lookups this gate
 * needs before it can decide.
 */
function PricingGridGate( { children }: { children: ReactNode } ) {
	const siteId = useSelector( getSelectedSiteId );
	// Choosing a plan swaps the dashboard in immediately; the server-side dismissal
	// catches up in the background and keeps the grid away on later visits.
	const [ hasChosen, setHasChosen ] = useState( false );

	const { isEligible, isNewConnection, isLoading } = useIsPricingGridEligible( siteId );
	const { data: isVisible, isLoading: isLoadingVisibility } = useNoticeVisibilityQuery(
		siteId,
		'pricing_grid',
		isNewConnection
	);

	if ( ! isNewConnection || hasChosen || hasChosenBeforeConnecting() ) {
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
