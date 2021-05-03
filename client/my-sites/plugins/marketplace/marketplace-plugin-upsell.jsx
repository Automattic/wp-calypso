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
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default function MarketplacePluginUpsell( props ) {
	const cost = useSelector( ( state ) => getProductCost( state, MARKETPLACE_YOAST ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	const { translate } = props;

	return (
		<div className="marketplace-plugin-upsell">
			<QueryProducts />
			<h3>{ translate( 'Premium' ) }</h3>
			<div class="marketplace-plugin-upsell__description">
				{ translate( 'Features included:' ) }
			</div>
			<ul>
				<li>
					<Gridicon size={ 12 } icon="checkmark" />
					{ translate( '.blog custom domain included' ) }
				</li>
				<li>
					<Gridicon size={ 12 } icon="checkmark" />
					{ translate( 'High performing keywords' ) }
				</li>
				<li>
					<Gridicon size={ 12 } icon="checkmark" />
					{ translate( 'Internal linking suggestions' ) }
				</li>
				<li>
					<Gridicon size={ 12 } icon="checkmark" />
					{ translate( 'Automate your publishing flow' ) }
				</li>
				<li>
					<Gridicon size={ 12 } icon="checkmark" />
					{ translate( '1 year of 24/7 support' ) }
				</li>
			</ul>

			{ isLoading ? null : (
				<div class="marketplace-plugin-upsell__cost">
					<span>{ displayCost }</span>/year
				</div>
			) }

			<Button primary>{ translate( 'Buy now' ) }</Button>

			<div class="marketplace-plugin-upsell__rest">
				{ translate( "Rest easy, we've got you covered with our 14-day money back guarantee." ) }
			</div>
			<div>{ translate( 'Try free' ) }</div>
		</div>
	);
}
