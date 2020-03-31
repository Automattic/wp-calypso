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
import { getJetpackProductsShortNames } from 'lib/products-values/constants';

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

	getOverlappingFeatureName( currentProductSlug ) {
		const { availableProducts } = this.props;
		if ( ! currentProductSlug ) {
			return null;
		}

		const productsShortNames = getJetpackProductsShortNames();
		if ( productsShortNames[ currentProductSlug ] ) {
			return productsShortNames[ currentProductSlug ].toLowerCase();
		}

		if ( availableProducts[ currentProductSlug ] ) {
			return availableProducts[ currentProductSlug ].product_name;
		}

		return null;
	}

	render() {
		const { selectedSiteId, translate } = this.props;

		return (
			<Fragment>
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				<QueryProductsList />

				{ this.getOverlappingProducts().map( productSlug => (
					<Notice
						key={ productSlug }
						showDismiss={ false }
						status="is-warning"
						text={ translate(
							'Your %(planName)s Plan includes %(featureName)s. ' +
								'Looks like you also purchased the %(productName)s product. ' +
								'Consider removing %(productName)s.',
							{
								args: {
									featureName: this.getOverlappingFeatureName( productSlug ),
									planName: this.getCurrentPlanName(),
									productName: this.getProductName( productSlug ),
								},
							}
						) }
					/>
				) ) }
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
