/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PurchaseDetail from 'components/purchase-detail';
import { recordTracksEvent } from 'state/analytics/actions';
import { getPlan, getPlanPath, isFreePlan } from 'lib/plans';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import page from 'page';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getCurrentPlan,
	getPlanDiscountedRawPrice,
	isRequestingSitePlans,
} from 'state/sites/plans/selectors';
import DocumentHead from 'components/data/document-head';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import { getPlanRawPrice, isRequestingPlans } from 'state/plans/selectors';
import { getCurrencyObject } from 'lib/format-currency';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class WordAdsUpsellComponent extends Component {
	static propTypes = {
		trackTracksEvent: PropTypes.func.isRequired,
		price: PropTypes.number,
		loadingPrice: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		const { price, loadingPrice, currentSitePlanSlug } = this.props;
		return (
			<div role="main" className="main is-wide-layout feature-upsell feature-upsell-ads">
				{ ! price && (
					<React.Fragment>
						<QueryPlans />
						<QuerySitePlans siteId={ this.props.selectedSiteId } />
						<QueryActivePromotions />
					</React.Fragment>
				) }

				<PageViewTracker path={ '/feature/ads/:site' } title="AdsUpsell" />
				<DocumentHead title={ 'Ads' } />

				<header className="feature-upsell-header">
					<h1 className="feature-upsell-header__title">Start making money with this site!</h1>
					<p className="feature-upsell-header__subtitle">
						Welcome to WordAds: the advertising platform where internet’s top ad suppliers bid
						against each other to deliver their ads to your site, maximizing your revenue.
					</p>
				</header>

				<div className="feature-upsell-cta">
					{ loadingPrice ? (
						<div className="feature-upsell-placeholder feature-upsell-placeholder--cta" />
					) : (
						<React.Fragment>
							<button
								onClick={ this.handleUpgradeButtonClick }
								className="button is-primary feature-upsell-cta__button"
							>
								Upgrade for { this.renderPrice() } and get started
							</button>
							<span className="feature-upsell-cta__guarantee">30-day money back guarantee</span>
						</React.Fragment>
					) }
				</div>

				<h2 className="feature-upsell-section-header">Price includes:</h2>

				<div className="product-purchase-features-list">
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-concierge.svg" /> }
							title={ 'Access to WordAds' }
							description={ '...' }
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/ads-removed.svg" /> }
							title={ 'Unlimited access to premium themes' }
							description={
								'Make your site perfect in just a few clicks with beautiful premium themes we prepared.'
							}
						/>
					</div>
					{ isFreePlan( currentSitePlanSlug ) ? (
						<div className="product-purchase-features-list__item">
							<PurchaseDetail
								icon={ <img alt="" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
								title={ 'Custom site address' }
								description={
									".com, .shop, or any other dot - it's on us. You choose an address and we pay for it."
								}
							/>
						</div>
					) : (
						false
					) }
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Advanced design customizations' }
							description={ '...' }
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Simple payments' }
							description={ '...' }
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Priority support' }
							description={
								'Need help? A Happiness Engineer can answer any question you may have about your ads and your account.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Even more!' }
							description={
								'Need help? A Happiness Engineer can answer any question you may have about your ads and your account.'
							}
						/>
					</div>
				</div>
			</div>
		);
	}

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_upsell_landing_page_cta_click', {
			cta_name: 'ads-upsell',
		} );

		page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( PLAN_PREMIUM ) || '' }` );
	};

	renderPrice() {
		if ( this.props.price === null ) {
			return null;
		}
		const priceObject = getCurrencyObject( this.props.price, this.props.currencyCode );
		let price = `${ priceObject.symbol }${ priceObject.integer }`;
		if ( this.props.price.toFixed( 5 ).split( '.' )[ 1 ] !== '00000' ) {
			price += priceObject.fraction;
		}
		return price;
	}
}

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );

	const upsellPlanSlug = PLAN_PREMIUM;
	const upsellPlan = getPlan( upsellPlanSlug );
	const upsellPlanId = upsellPlan.getProductId();
	const rawPrice = getPlanRawPrice( state, upsellPlanId, false );
	const discountedRawPrice = getPlanDiscountedRawPrice( state, selectedSiteId, upsellPlanSlug, {
		isMonthly: false,
	} );
	const price = discountedRawPrice || rawPrice;

	return {
		price,
		selectedSite,
		currentSitePlan,
		currentSitePlanSlug: currentSitePlan ? currentSitePlan.productSlug : '',
		loadingPrice:
			! price &&
			( isRequestingPlans( state ) ||
				isRequestingSitePlans( state ) ||
				isRequestingActivePromotions( state ) ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
		trackTracksEvent: recordTracksEvent,
	};
};

export default connect( mapStateToProps )( localize( WordAdsUpsellComponent ) );
/* eslint-enable wpcalypso/jsx-classname-namespace */
