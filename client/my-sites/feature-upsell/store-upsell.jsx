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
import { PLAN_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import page from 'page';
import { getSiteSlug, canCurrentUserUseStore } from 'state/sites/selectors';
import { getCurrentPlan, isRequestingSitePlans, hasFeature } from 'state/sites/plans/selectors';
import DocumentHead from 'components/data/document-head';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import RefundAsterisk from 'my-sites/feature-upsell/refund-asterisk';
import TipInfo from 'components/purchase-detail/tip-info';
import { isRequestingPlans } from 'state/plans/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';
import { getUpsellPlanPrice, redirectUnlessCanUpgradeSite } from './utils';
import redirectIf from './redirect-if';

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

				<div className="feature-upsell__card">
					<h1 className="feature-upsell__card-header is-capital is-main">
						Add an eCommerce store to this site
					</h1>
					<h2 className="feature-upsell__card-header is-sub">
						Start selling now in United States - or go global - with the world’s most customizable
						platform. We'll help you get rolling.
					</h2>

					<div className="feature-upsell__cta">
						{ loadingPrice ? (
							<div className="feature-upsell__placeholder is-cta" />
						) : (
							<React.Fragment>
								<button
									onClick={ this.handleUpgradeButtonClick }
									className="button is-primary feature-upsell__cta-button"
								>
									Upgrade to Business plan for { this.renderPrice() } and get started
								</button>
								<span className="feature-upsell__cta-guarantee">* 30-day money-back guarantee</span>
							</React.Fragment>
						) }
					</div>
				</div>

				<div className="feature-upsell__text-content">
					<h4 className="feature-upsell__header-section is-h4">Price also includes:</h4>
				</div>

				<div className="feature-upsell__features-list">
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="user" size={ 48 } /> }
							title={ 'A one-on-one session with us' }
							description={
								'Getting where you want is easier with an expert guide. Our experts will flatten out your learning curve.'
							}
						/>
					</div>
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="chat" size={ 48 } /> }
							title={ 'Priority support' }
							description={
								'Need help? Our Happiness Engineers can answer any questions about your new store and account.'
							}
						/>
					</div>
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="money" size={ 48 } /> }
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
					) : (
						<div className="feature-upsell__features-list-item">
							<Feature
								icon={ <Gridicon icon="plugins" size={ 48 } /> }
								title={ 'Install Plugins' }
								description={
									'Plugins are like smartphone apps for WordPress. They provide features like: ' +
									'SEO and marketing, lead generation, appointment booking, and much, much more.'
								}
							/>
						</div>
					) }
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="themes" size={ 48 } /> }
							title={ 'Access to premium themes' }
							description={
								'You don’t have to be a designer to make a beautiful site. Choose from a range of business-focused layouts created by pros.'
							}
						/>
					</div>
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="gift" size={ 48 } /> }
							title={ 'Even more!' }
							description={
								'Install plugins, access advanced SEO features, and more. You’ll have all the tools for a successful store.'
							}
						/>
					</div>
				</div>
				<RefundAsterisk />
			</div>
		);
	}

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_banner_cta_click', {
			cta_name: 'upsell-page-store',
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

const mapStateToProps = ( state ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	const price = getUpsellPlanPrice( state, PLAN_BUSINESS, selectedSiteId );

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
	redirectIf(
		( state, siteId ) =>
			canCurrentUserUseStore( state ) || hasFeature( state, siteId, FEATURE_UPLOAD_PLUGINS ),
		'/store'
	)
)( StoreUpsellComponent );

/* eslint-enable wpcalypso/jsx-classname-namespace */
