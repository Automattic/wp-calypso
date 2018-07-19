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
import TipInfo from 'components/purchase-detail/tip-info';
import { getPlanRawPrice, isRequestingPlans } from 'state/plans/selectors';
import { getCurrencyObject } from 'lib/format-currency';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

/*
 * This is just for english audience and is not translated on purpose, remember to add
 * translate() calls before removing a/b test check and enabling it for everyone
 */
class StoreUpsellComponent extends Component {
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
			<div role="main" className="main is-wide-layout feature-upsell__main">
				{ ! price && (
					<React.Fragment>
						<QueryPlans />
						<QuerySitePlans siteId={ this.props.selectedSiteId } />
						<QueryActivePromotions />
					</React.Fragment>
				) }

				<PageViewTracker path={ '/feature/store/:site' } title="StoreUpsell" />
				<DocumentHead title={ 'Store' } />

				<div className="feature-upsell__text-content">
					<header className="feature-upsell__header">
						<h1 className="feature-upsell__header-title">Add an eCommerce store to this site</h1>
						<p className="feature-upsell__header-subtitle">
							Start selling now in United States - or go global - with the world’s most customizable
							platform. We'll help you get rolling.
						</p>
					</header>

					<div className="feature-upsell__cta">
						{ loadingPrice ? (
							<div className="feature-upsell__placeholder feature-upsell__placeholder--cta" />
						) : (
							<React.Fragment>
								<button
									onClick={ this.handleUpgradeButtonClick }
									className="button is-primary feature-upsell__cta-button"
								>
									Upgrade to Business plan for { this.renderPrice() } and get started
								</button>
								<span className="feature-upsell__cta-guarantee">30-day money back guarantee</span>
							</React.Fragment>
						) }
					</div>

					<h2 className="feature-upsell__section-header">Price includes:</h2>
				</div>

				<div className="product-purchase-features-list">
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-concierge.svg" /> }
							title={ 'A one-on-one session with us' }
							description={
								'Getting where you want is easier with an expert guide. Our experts will flatten out your learning curve.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title={ 'Priority support' }
							description={
								'Need help? Our Happiness Engineers can answer any questions about your new store and account.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/google-adwords.svg" /> }
							title={ '$100 for Google AdWords' }
							description={ 'Attract new (and more!) traffic immediately with Google AdWords.' }
							body={
								<div className="google-voucher__initial-step">
									<TipInfo
										info={ 'Offer valid in US after spending the first $25 on Google AdWords.' }
									/>
								</div>
							}
						/>
					</div>
					{ isFreePlan( currentSitePlanSlug ) ? (
						<div className="product-purchase-features-list__item">
							<PurchaseDetail
								icon={ <img alt="" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
								title={ 'Custom site address' }
								description={
									'Make your site memorable and professional - choose a .com, .shop, or any other dot.'
								}
							/>
						</div>
					) : (
						<div className="product-purchase-features-list__item">
							<PurchaseDetail
								icon={ <img alt="" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
								title={ 'Install Plugins' }
								description={
									'Plugins are like smartphone apps for WordPress. They provide features like: ' +
									'SEO and marketing, lead generation, appointment booking, and much, much more.'
								}
							/>
						</div>
					) }
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/ads-removed.svg" /> }
							title={ 'Access to premium themes' }
							description={
								'You don’t have to be a designer to make a beautiful site. Choose from a range of business-focused layouts created by pros.'
							}
						/>
					</div>
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-updates.svg" /> }
							title={ 'Even more!' }
							description={
								'Install plugins, access advanced SEO features, and more. You’ll have all the tools for a successful store.'
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

export default connect( mapStateToProps )( localize( StoreUpsellComponent ) );
/* eslint-enable wpcalypso/jsx-classname-namespace */
