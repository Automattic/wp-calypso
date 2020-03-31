/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug } from 'state/sites/plans/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { planHasFeature, planHasSuperiorFeature } from 'lib/plans';
import { managePurchase } from 'me/purchases/paths';

class ProductPlanOverlapNotices extends Component {
	static propTypes = {
		plans: PropTypes.arrayOf( PropTypes.string ).isRequired,
		products: PropTypes.arrayOf( PropTypes.string ).isRequired,
		siteId: PropTypes.number,

		// Connected props
		availableProducts: PropTypes.object,
		currentPlanSlug: PropTypes.string,
		purchases: PropTypes.array,
		selectedSiteId: PropTypes.number,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	getOverlappingProducts() {
		const { availableProducts, currentPlanSlug, plans, purchases } = this.props;

		if ( ! currentPlanSlug || ! purchases || ! availableProducts ) {
			return [];
		}

		// Is the current plan among the plans we're interested in?
		if ( ! includes( plans, currentPlanSlug ) ) {
			return [];
		}

		// Is the current product among the products we're interested in?
		const currentProductSlugs = this.getCurrentProductSlugs();
		if ( ! currentProductSlugs.length ) {
			return [];
		}

		// Does the current plan include the current product as a feature, or have a superior version of it?
		return currentProductSlugs.filter(
			productSlug =>
				planHasFeature( currentPlanSlug, productSlug ) ||
				planHasSuperiorFeature( currentPlanSlug, productSlug )
		);
	}

	getCurrentProductSlugs() {
		const { products, purchases } = this.props;

		const currentProducts = purchases.filter( purchase =>
			includes( products, purchase.productSlug )
		);
		return currentProducts.map( product => product.productSlug );
	}

	getProductName( currentProductSlug ) {
		const { availableProducts } = this.props;

		if ( ! currentProductSlug || ! availableProducts[ currentProductSlug ] ) {
			return '';
		}

		return availableProducts[ currentProductSlug ].product_name;
	}

	getCurrentPlanName() {
		const { availableProducts, currentPlanSlug } = this.props;

		if ( ! availableProducts[ currentPlanSlug ] ) {
			return '';
		}

		return availableProducts[ currentPlanSlug ].product_name;
	}

	getProductItem( productSlug ) {
		const { purchases } = this.props;
		const productPurchase = purchases.find( purchase => purchase.productSlug === productSlug );

		if ( ! productPurchase ) {
			return false;
		}

		return (
			<li key={ productSlug }>
				<a href={ managePurchase( productPurchase.domain, productPurchase.id ) }>
					{ this.getProductName( productSlug ) }
				</a>
			</li>
		);
	}

	render() {
		const { selectedSiteId, translate } = this.props;
		const overlappingProductSlugs = this.getOverlappingProducts();

		return (
			<Fragment>
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				<QueryProductsList />

				{ 0 !== overlappingProductSlugs.length && (
					<Notice
						showDismiss={ false }
						text={ translate(
							'Your %(planName)s Plan includes:' +
								'{{list/}}' +
								'Consider removing conflicting products.',
							{
								args: {
									planName: this.getCurrentPlanName(),
								},
								components: {
									list: (
										<ul>
											{ overlappingProductSlugs.map( productSlug =>
												this.getProductItem( productSlug )
											) }
										</ul>
									),
								},
							}
						) }
					/>
				) }
			</Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	const selectedSiteId = siteId || getSelectedSiteId( state );

	return {
		availableProducts: getAvailableProductsList( state ),
		currentPlanSlug: getSitePlanSlug( state, selectedSiteId ),
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSiteId,
	};
} )( localize( ProductPlanOverlapNotices ) );
