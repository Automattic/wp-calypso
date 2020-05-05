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
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import DocumentHead from 'components/data/document-head';
import TipInfo from '../../components/purchase-detail/tip-info';

/**
 * Image dependencies
 */
import googleAdwordsImage from 'assets/images/illustrations/google-adwords.svg';
import supportImage from 'assets/images/illustrations/dotcom-support.svg';
import adsRemovedImage from 'assets/images/illustrations/ads-removed.svg';
import themesImage from 'assets/images/illustrations/themes.svg';
import dashboardImage from 'assets/images/illustrations/dashboard.svg';
import wordAdsImage from 'assets/images/illustrations/dotcom-wordads.svg';
import videoImage from 'assets/images/illustrations/video-hosting.svg';
import conciergeImage from 'assets/images/illustrations/jetpack-concierge.svg';
import appsImage from 'assets/images/illustrations/apps.svg';
import analyticsImage from 'assets/images/illustrations/google-analytics.svg';
import googleMyBusinessImage from 'assets/images/illustrations/google-my-business-feature.svg';
import searchImage from 'assets/images/illustrations/jetpack-search.svg';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class FeaturesComponent extends Component {
	static propTypes = {
		trackTracksEvent: PropTypes.func.isRequired,
		price: PropTypes.number,
		loadingPrice: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				<PageViewTracker path={ '/feature/:site' } title="FeaturesList" />
				<DocumentHead title={ 'Features' } />

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__section-header">Personal plan features</h2>
				</div>

				<div className="product-purchase-features-list">{ this.renderPersonalFeatures() }</div>

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__section-header">Premium plan features</h2>
				</div>

				<div className="product-purchase-features-list">{ this.renderPremiumFeatures() }</div>

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__section-header">Business plan features</h2>
				</div>

				<div className="product-purchase-features-list">{ this.renderBusinessFeatures() }</div>
			</div>
		);
	}

	renderPersonalFeatures() {
		const { translate } = this.props;
		return (
			<>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ supportImage } /> }
						title={ 'Priority support' }
						description={
							'Unlimited access to our world-class live chat and email support. No question is too big or too small!'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ appsImage } /> }
						title={ 'Custom site address' }
						description={
							'Make your site memorable and professional - choose a .com, .shop, or any other dot.'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ adsRemovedImage } /> }
						title={ translate( 'Advertising removed' ) }
						description="All WordPress.com advertising is removed from your site."
					/>
				</div>
			</>
		);
	}

	renderPremiumFeatures() {
		const { translate, selectedSite } = this.props;
		return (
			<>
				{ this.renderPersonalFeatures() }

				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ googleAdwordsImage } /> }
						title={ '$100 for Google Ads' }
						description={ 'Attract new (and more!) traffic immediately with Google Ads.' }
						body={
							<div className="google-voucher__initial-step">
								<TipInfo
									info={ 'Offer valid in US and CA after spending the first $25 on Google Ads.' }
								/>
							</div>
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ themesImage } /> }
						title={ 'Access to premium themes' }
						description={
							'You don’t have to be a designer to make a beautiful site. Choose from a range of business-focused layouts created by pros.'
						}
						buttonText={ translate( 'Browse premium themes' ) }
						href={ '/themes/' + selectedSite.slug }
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ dashboardImage } /> }
						title={ 'Advanced design customizations' }
						description={
							'Take creative control with additional customization features - like color schemes and, background designs, or add completely ' +
							'personal touches with your CSS code.'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ wordAdsImage } /> }
						title={ 'Simple payments' }
						description={
							'Accept credit card payments on your site with the click of a button! Sell products, take donations, ' +
							'sell tickets - add payment buttons to any page right from the WordPress editor'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ videoImage } /> }
						title={ translate( 'Video and audio posts' ) }
						description={
							'Enrich your posts and pages with video or audio. Upload as media ' +
							'directly to your site.'
						}
					/>
				</div>
			</>
		);
	}

	renderBusinessFeatures() {
		const { translate } = this.props;
		return (
			<>
				{ this.renderPremiumFeatures() }

				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ conciergeImage } /> }
						title={ 'A one-on-one session with us' }
						description={
							'Getting where you want is easier with an expert guide. Our experts will flatten out your learning curve.'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ appsImage } /> }
						title={ 'Install Plugins' }
						description={
							'Plugins are like smartphone apps for WordPress. They provide features like: ' +
							'SEO and marketing, lead generation, appointment booking, and much, much more.'
						}
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ analyticsImage } /> }
						title={ translate( 'Google Analytics' ) }
						description={ translate(
							"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
						) }
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ googleMyBusinessImage } /> }
						title={ translate( 'Google My Business' ) }
						description={ translate(
							'See how customers find you on Google -- and whether they visited your site and looked for more info on your business -- by connecting to a Google My Business location.'
						) }
					/>
				</div>
				<div className="product-purchase-features-list__item">
					<PurchaseDetail
						icon={ <img alt="" src={ searchImage } /> }
						title={ translate( 'Jetpack search' ) }
						description={ translate(
							'Replace the default WordPress search with better results ' +
								'and filtering powered by Elasticsearch.'
						) }
					/>
				</div>
			</>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );

	return {
		selectedSite,
		currentSitePlan,
		currentSitePlanSlug: currentSitePlan ? currentSitePlan.productSlug : '',
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
		trackTracksEvent: recordTracksEvent,
	};
};

export default connect( mapStateToProps )( localize( FeaturesComponent ) );
/* eslint-enable wpcalypso/jsx-classname-namespace */
