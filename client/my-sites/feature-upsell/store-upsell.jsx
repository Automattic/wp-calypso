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
import { getPlan, getPlanPath } from 'lib/plans';
import { PLAN_BUSINESS } from 'lib/plans/constants';
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

class StoreUpsellComponent extends Component {
	static propTypes = {
		trackTracksEvent: PropTypes.func.isRequired,
		price: PropTypes.number,
		loadingPrice: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		const { price, loadingPrice } = this.props;
		return (
			<div role="main" className="main is-wide-layout feature-upsell feature-upsell-store">
				{ ! price && (
					<React.Fragment>
						<QueryPlans />
						<QuerySitePlans siteId={ this.props.selectedSiteId } />
						<QueryActivePromotions />
					</React.Fragment>
				) }

				<PageViewTracker path={ '/feature/store/:site' } title="StoreUpsell" />
				<DocumentHead title={ 'Store' } />

				<header className="feature-upsell-header">
					<h1 className="feature-upsell-header__title">Add an eCommerce store to this site</h1>
					<p className="feature-upsell-header__subtitle">
						Start selling now in United States - or go global - with the world’s most customizable
						platform. We will even help you get rolling.
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
							title={ '1 on 1 session with us' }
							description={
								'Getting where you want is easier when you have a guide. An expert will show you around and help you with setup.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Priority support' }
							description={
								'Need help? A Happiness Engineer can answer any question you may have about your store and your account.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/google-adwords.svg" /> }
							title={ '$100 for Google AdWords' }
							description={ 'Start bringing traffic immediately with Google AdWords.' }
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
							title={ 'Custom site address' }
							description={
								".com, .shop, or any other dot - it's on us. You choose an address and we pay for it."
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/ads-removed.svg" /> }
							title={ 'Access to premium themes' }
							description={
								'Make your site perfect in just a few clicks with beautiful premium themes we prepared.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-updates.svg" /> }
							title={ 'Even more!' }
							description={
								'Install plugins, start using advanced SEO features, and even more. We give you all the tools to make your store successful.'
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
			cta_name: 'store-upsell',
		} );

		page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( PLAN_BUSINESS ) || '' }` );
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

	const currentPlan = getPlan( PLAN_BUSINESS );
	const currentPlanId = currentPlan.getProductId();
	const rawPrice = getPlanRawPrice( state, currentPlanId, false );
	const discountedRawPrice = getPlanDiscountedRawPrice( state, selectedSiteId, PLAN_BUSINESS, {
		isMonthly: false,
	} );
	const price = discountedRawPrice || rawPrice;

	return {
		price,
		selectedSite,
		currentSitePlan,
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

export default connect( mapStateToProps )( localize( StoreUpsellComponent ) );
/* eslint-enable wpcalypso/jsx-classname-namespace */
