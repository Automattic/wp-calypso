/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import CartData from 'calypso/components/data/cart';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/constants';

const StandardPlansHeader = () => (
	<>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="left" brandFont />
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	</>
);
const ConnectFlowPlansHeader = () => (
	<>
		<div className="jetpack-plans__heading">
			<FormattedHeader
				headerText={ translate( 'Explore our Jetpack plans' ) }
				subHeaderText={ translate( "Now that you're set up, pick a plan that fits your needs." ) }
				align="left"
				brandFont
			/>
		</div>
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	</>
);

const PlansHeader = ( { context }: { context: PageJS.Context } ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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

	// Only show ConnectFlowPlansHeader if coming from in-connect flow and if no products or plans have been purchased.
	return isInConnectFlow && currentPlan === PLAN_JETPACK_FREE && ! purchasedProducts.length ? (
		<>
			{ showNotice && (
				<Notice status="is-success" onDismissClick={ () => setShowNotice( false ) }>
					{ translate( 'Jetpack is now connected. Next select a plan.' ) }
				</Notice>
			) }
			<ConnectFlowPlansHeader />
		</>
	) : (
		<StandardPlansHeader />
	);
};

export default function setJetpackHeader( context: PageJS.Context ) {
	context.header = <PlansHeader context={ context } />;
}
