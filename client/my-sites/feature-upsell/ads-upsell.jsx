/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Feature from 'my-sites/feature-upsell/feature';
import { recordTracksEvent } from 'state/analytics/actions';
import { getPlanPath, isFreePlan } from 'lib/plans';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import page from 'page';
import { getSiteSlug, canCurrentUserUseAds } from 'state/sites/selectors';
import { getCurrentPlan, isRequestingSitePlans } from 'state/sites/plans/selectors';
import DocumentHead from 'components/data/document-head';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import RefundAsterisk from 'my-sites/feature-upsell/refund-asterisk';
import { isRequestingPlans } from 'state/plans/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';
import { getUpsellPlanPrice, redirectUnlessCanUpgradeSite } from './utils';
import redirectIf from './redirect-if';

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

				<div className="feature-upsell__text-content">
					<header className="feature-upsell__header">
						<h1 className="feature-upsell__header-title">Start making money with this site!</h1>
					</header>
				</div>

				<div className="feature-upsell__video-box">
					<div className="feature-upsell__video-container">
						<div className="feature-upsell__placeholder is-cover" />
						<iframe
							title="How WordAds work?"
							width="100%"
							height="100%"
							className="feature-upsell__video-frame"
							src="https://videopress.com/embed/kRaHRuHQ"
							frameBorder="0"
							allowFullScreen={ true }
						/>
					</div>
					<div className="feature-upsell__video-description">
						<p>
							<b>Welcome to WordAds</b>: the advertising platform where internet’s top ad suppliers
							bid against each other to get their ads to your site.
						</p>

						{ this.renderCTA( 'is-in-video-box' ) }
					</div>
				</div>

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__header-section">We'll do the work, you make the money</h2>
				</div>

				<ul className="feature-upsell__benefits-list">
					<li className="feature-upsell__benefits-list-item is-enable-wordads">
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">Enable WordAds</div>
							<div className="feature-upsell__benefits-list-description">
								Once you upgrade, install WordAds on your site (we'll help!) in just a few clicks.
								WordAds places ads automatically, optimizing their placement on your site to give
								you the best return. No need to approve individual ads - turn WordAds on, and it
								does the rest.
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="/calypso/images/illustrations/upsell-enable.svg"
							/>
						</div>
					</li>
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">
								Display high quality ads on your site
							</div>
							<div className="feature-upsell__benefits-list-description">
								We only partner with advertisers that offer family-friendly ads, and our fraud
								prevention team proactively identifies malicious ads. That means WordAds won't show
								ads that contains nudity, promotes gambling, or makes fraudulent claims, and you
								don't have to worry what visitors will see. If you ever do have a question or
								concern, Automattic’s global team of Happiness Engineers are always available.
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="/calypso/images/illustrations/upsell-show-ads.svg"
							/>
						</div>
					</li>
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-item-content">
							<div className="feature-upsell__benefits-list-name">Collect your payout</div>
							<div className="feature-upsell__benefits-list-description">
								You’re paid whenever the ad is seen by a visitor, whether they click on it or not,
								so the more visits you get, and the more pages each visitor visits, the more you’ll
								earn. WordAds pays monthly via PayPal (if you earn less than $100 in a month, your
								earnings will carry over to the next month instead).
							</div>
						</div>
						<div className="feature-upsell__benefits-list-image-wrapper">
							<img
								alt=""
								className="feature-upsell__benefits-list-image"
								src="/calypso/images/illustrations/upsell-payments.svg"
							/>
						</div>
					</li>
					<li className="feature-upsell__benefits-list-item">
						<div className="feature-upsell__benefits-list-item-content">
							{ this.renderCTA( 'is-in-benefit' ) }
						</div>
					</li>
				</ul>

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__header-section is-h4">Price also includes</h2>
				</div>

				<div className="feature-upsell__features-list">
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="types" size={ 48 } /> }
							title={ 'Unlimited access to premium themes' }
							description={
								'You don’t have to be a designer to make a beautiful site. Choose from a range of layouts created by pros.'
							}
						/>
					</div>
					{ isFreePlan( currentSitePlanSlug ) ? (
						<div className="feature-upsell__features-list-item">
							<Feature
								icon={ <Gridicon icon="domains" size={ 48 } /> }
								title={ 'Custom site address' }
								description={
									'Make your site memorable and professional - choose a .com, .shop, or any other dot.'
								}
							/>
						</div>
					) : null }
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="customize" size={ 48 } /> }
							title={ 'Advanced design customizations' }
							description={
								'Take creative control with additional customization features - like color schemes and, background designs, or add completely ' +
								'personal touches with your CSS code.'
							}
						/>
					</div>
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="money" size={ 48 } /> }
							title={ 'Simple Payments' }
							description={
								'Accept credit card payments on your site with the click of a button! Sell products, take donations, ' +
								'sell tickets - add payment buttons to any page right from the WordPress editor'
							}
						/>
					</div>
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="chat" size={ 48 } /> }
							title={ 'Priority support' }
							description={
								'Unlimited access to our world-class live chat and email support. No question is too big or too small!'
							}
						/>
					</div>
				</div>
				<RefundAsterisk />
			</div>
		);
	}

	renderCTA( className = '' ) {
		const { loadingPrice } = this.props;

		return (
			<div className={ 'feature-upsell__cta ' + className }>
				{ loadingPrice ? (
					<div className="feature-upsell__placeholder is-cta" />
				) : (
					<React.Fragment>
						<p className="feature-upsell__cta-pitch">
							<b>
								Upgrade to a Premium plan for { this.renderPrice() } and start earning revenue from
								your site
							</b>
						</p>
						<button
							onClick={ this.handleUpgradeButtonClick }
							className="button is-primary feature-upsell__cta-button"
						>
							Upgrade now
						</button>
						<span className="feature-upsell__cta-guarantee">* 30-day money-back guarantee</span>
					</React.Fragment>
				) }
			</div>
		);
	}

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_banner_cta_click', {
			cta_name: 'upsell-page-ads',
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

const mapStateToProps = ( state ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	const price = getUpsellPlanPrice( state, PLAN_PREMIUM, selectedSiteId );

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
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	trackTracksEvent: ( name, props ) => dispatch( recordTracksEvent( name, props ) ),
} );

export default flowRight(
	connect( mapStateToProps, mapDispatchToProps ),
	localize,
	redirectUnlessCanUpgradeSite,
	redirectIf( ( state ) => canCurrentUserUseAds( state ), '/ads/settings' )
)( WordAdsUpsellComponent );

/* eslint-enable wpcalypso/jsx-classname-namespace */
