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

	if ( ! isNewConnection || hasChosen ) {
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
