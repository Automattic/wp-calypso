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
		const { price, currentSitePlanSlug } = this.props;
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				{ ! price && (
					<React.Fragment>
						<QueryPlans />
						<QuerySitePlans siteId={ this.props.selectedSiteId } />
						<QueryActivePromotions />
					</React.Fragment>
				) }

				<PageViewTracker path={ '/feature/ads/:site' } title="AdsUpsell" />
				<DocumentHead title={ 'Ads' } />

				<header className="feature-upsell__header">
					<h1 className="feature-upsell__header-title">Start making money with this site!</h1>
					<p className="feature-upsell__header-subtitle">
						Welcome to WordAds: the advertising platform where internet’s top ad suppliers bid
						against each other to deliver their ads to your site, maximizing your revenue.
					</p>
				</header>

				<h2 className="feature-upsell__section-header">How it works?</h2>

				<div className="feature-upsell__video-container">
					<div className="feature-upsell__placeholder feature-upsell__placeholder--cover" />
					<iframe
						title="How WordAds work?"
						width="100%"
						height="100%"
						className="feature-upsell__video"
						src="https://videopress.com/embed/kRaHRuHQ"
						frameborder="0"
						allowfullscreen
					/>
				</div>

				{ this.renderCTA() }

				<h2 className="feature-upsell__section-header">As simple as 1, 2, 3</h2>

				<ul className="feature-upsell__benefits-list">
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-marker">1.</div>
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">Enable WordAds</div>
							<div className="feature-upsell__benefits-list-description">
								After you upgrade, you can install WordAds on your site in just a few clicks.
								WordAds places the ads automatically, optimizes their placement in your page layout
								to give you the best return. No need to approve individual ads. Just turn it on and
								WordAds does the rest.
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="https://s2.wp.com/wp-content/themes/a8c/wordads/i/wordads_turn-on-ads@2x.png"
							/>
						</div>
					</li>
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-marker">2.</div>
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">
								High quality Ads start to show on your site
							</div>
							<div className="feature-upsell__benefits-list-description">
								We only partner with advertisers that display family-friendly ads, and our fraud
								prevention team proactively identifies malicious ads. That means WordAds won't place
								an advertisement that contains nudity, promotes gambling, or makes fraudulent claims
								on your site, and you don't have to worry what visitors will see. If you have any
								questions, Automattic’s global team of happiness engineers are always available to
								address any questions and concerns.
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="https://s2.wp.com/wp-content/themes/a8c/wordads/i/wordads_high-quality-ads@2x.png"
							/>
						</div>
					</li>
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-marker">3.</div>
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">Collect the payout</div>
							<div className="feature-upsell__benefits-list-description">
								You’re paid when the ad is seen by a visitor, not by click. That means the more
								visits you get, and the more each visitor uses your site, the more you’ll earn.
								WordAds pays monthly via PayPal. Payments are sent around the last day of the
								following month. If you earned less than $100 in a given month, your earnings will
								carry over to the next month instead.
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="https://s2.wp.com/wp-content/themes/a8c/wordads/i/wordads_impressions-2017-Q3.@2x.png"
							/>
						</div>
					</li>
				</ul>

				{ this.renderCTA() }

				<h2 className="feature-upsell__section-header">Price includes also:</h2>

				<div className="product-purchase-features-list">
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
					) : null }
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-dashboard.svg" /> }
							title={ 'Advanced design customizations' }
							description={
								'Make your site look perfect with additional customization features - extended color schemes, background designs, and complete control over website CSS.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-wordads.svg" /> }
							title={ 'Simple payments' }
							description={
								'Accept credit card payments right on your site with the click of a button! Whether you sell products, memberships, ' +
								'or subscriptions - we got you covered.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Priority support' }
							description={
								'Unlimited access to our world-class live chat and email support - no matter how complicated your question, our team ' +
								'will find you an answer, guaranteed.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-updates.svg" /> }
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

	renderCTA() {
		const { loadingPrice } = this.props;

		return (
			<div className="feature-upsell__cta">
				{ loadingPrice ? (
					<div className="feature-upsell__placeholder feature-upsell__placeholder--cta" />
				) : (
					<React.Fragment>
						<button
							onClick={ this.handleUpgradeButtonClick }
							className="button is-primary feature-upsell__cta-button"
						>
							Upgrade for { this.renderPrice() } and get started
						</button>
						<span className="feature-upsell__cta-guarantee">30-day money back guarantee</span>
					</React.Fragment>
				) }
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
