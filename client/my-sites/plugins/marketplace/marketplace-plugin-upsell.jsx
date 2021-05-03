/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryProducts from 'calypso/components/data/query-products-list';
import { getProductCost, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { MARKETPLACE_YOAST } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { Button } from '@automattic/components';

export default function MarketplacePluginUpsell() {
	const cost = useSelector( ( state ) => getProductCost( state, MARKETPLACE_YOAST ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	return (
		<>
			<QueryProducts />
			<h4>Premium</h4>
			<div>Features included:</div>
			<ul>
				<li>.blog custom domain included</li>
				<li>High performing keywords</li>
				<li>Internal linking suggestions</li>
				<li>Automate your publishing flow</li>
				<li>1 year of 24/7 support</li>
			</ul>

			{ isLoading ? null : <div>{ displayCost }/year</div> }

			<Button>Buy now</Button>

			<div>Rest easy, we've got you covered with our 14-day money back guarantee.</div>
			<div>Try free</div>
		</>
	);
}
