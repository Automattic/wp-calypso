/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, includes, some } from 'lodash';
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

	hasOverlap() {
		const { availableProducts, currentPlanSlug, plans, products, purchases } = this.props;

		if ( ! currentPlanSlug || ! purchases || ! availableProducts ) {
			return false;
		}

		// Is the current plan among the plans we're interested in?
		if ( ! includes( plans, currentPlanSlug ) ) {
			return false;
		}

		// Is the current product among the products we're interested in?
		const currentProductSlug = this.getCurrentProductSlug();
		if ( ! currentProductSlug ) {
			return false;
		}

		// Does the current plan include the current product as a feature, or have a superior version of it?
		return some(
			products,
			productSlug =>
				productSlug === currentProductSlug &&
				( planHasFeature( currentPlanSlug, productSlug ) ||
					planHasSuperiorFeature( currentPlanSlug, productSlug ) )
		);
	}

	getCurrentProductSlug() {
		const { products, purchases } = this.props;

		const currentProduct = find( purchases, purchase =>
			includes( products, purchase.productSlug )
		);
		if ( ! currentProduct ) {
			return null;
		}

		return currentProduct.productSlug;
	}

	getCurrentProductName() {
		const { availableProducts } = this.props;
		const currentProductSlug = this.getCurrentProductSlug();

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

	getOverlappingFeatureName() {
		const { availableProducts } = this.props;

		if ( ! this.hasOverlap() ) {
			return null;
		}

		const currentProductSlug = this.getCurrentProductSlug();
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

				{ this.hasOverlap() && (
					<Notice
						showDismiss={ false }
						status="is-warning"
						text={ translate(
							'Your %(planName)s Plan includes %(featureName)s. ' +
								'Looks like you also purchased the %(productName)s product. ' +
								'Consider removing %(productName)s.',
							{
								args: {
									featureName: this.getOverlappingFeatureName(),
									planName: this.getCurrentPlanName(),
									productName: this.getCurrentProductName(),
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
