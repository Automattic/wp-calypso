/**
 * External dependencies
 */
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import type { RequestCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/constants';
import getCartKey from 'calypso/my-sites/checkout/get-cart-key';
import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

const wpcomGetCart = ( cartKey: string ) => wpcom.getCart( cartKey );
const wpcomSetCart = ( cartKey: string, requestCart: RequestCart ) =>
	wpcom.setCart( cartKey, requestCart );

const StandardPlansHeader = () => (
	<>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="left" brandFont />
		<PlansNavigation path={ '/plans' } />
	</>
);
const ConnectFlowPlansHeader = () => (
	<>
		<div className="plans-v2__heading">
			<FormattedHeader
				headerText={ translate( 'Explore our Jetpack plans' ) }
				subHeaderText={ translate( "Now that you're set up, pick a plan that fits your needs." ) }
				align="left"
				brandFont
			/>
		</div>
		<PlansNavigation path={ '/plans' } />
	</>
);

const PlansHeader = ( { context }: { context: PageJS.Context } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const selectedSite = useSelector( getSelectedSite );
	// Site plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	// Site products from direct purchases
	const purchasedProducts =
		useSelector( ( state ) => getSiteProducts( state, siteId ) )
			?.map( ( { productSlug } ) => productSlug )
			.filter( ( productSlug ) => JETPACK_PRODUCTS_LIST.includes( productSlug ) ) ?? [];

	// When coming from in-connect flow, the url contains 'source=jetpack-connect-plans' query param.
	const isInConnectFlow = context.query?.source === 'jetpack-connect-plans';

	const [ showNotice, setShowNotice ] = useState( true );

	const cartKey = useMemo( () => getCartKey( { selectedSite } ), [ selectedSite ] );

	// Only show ConnectFlowPlansHeader if coming from in-connect flow and if no products or plans have been purchased.
	return isInConnectFlow && currentPlan === PLAN_JETPACK_FREE && ! purchasedProducts.length ? (
		<ShoppingCartProvider cartKey={ cartKey } getCart={ wpcomGetCart } setCart={ wpcomSetCart }>
			{ showNotice && (
				<Notice status="is-success" onDismissClick={ () => setShowNotice( false ) }>
					{ translate( 'Jetpack is now connected. Next select a plan.' ) }
				</Notice>
			) }
			<ConnectFlowPlansHeader />
		</ShoppingCartProvider>
	) : (
		<ShoppingCartProvider cartKey={ cartKey } getCart={ wpcomGetCart } setCart={ wpcomSetCart }>
			<StandardPlansHeader />
		</ShoppingCartProvider>
	);
};

export default function setJetpackHeader( context: PageJS.Context ): void {
	context.header = <PlansHeader context={ context } />;
}
