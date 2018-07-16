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
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import page from 'page';
import { getPlanPath } from 'lib/plans';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import PurchaseDetail from 'components/purchase-detail';

class PluginsUpsellComponent extends Component {
	static propTypes = {
		trackTracksEvent: PropTypes.func.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_upsell_landing_page_cta_click', {
			cta_name: 'plugins-upsell',
		} );

		page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( PLAN_BUSINESS ) || '' }` );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				<PageViewTracker path={ '/feature/plugins/:site' } title="PluginsUpsell" />
				<DocumentHead title={ 'Plugins' } />

				<header className="feature-upsell__header">
					<h1 className="feature-upsell__header-title">
						WordPress Plugins are now available on the Business plan.
					</h1>
					<p className="feature-upsell__header-subtitle">
						Upgrading to the Business plan unlocks access to more than 50,000 WordPress Plugins and
						197 premium Themes, making it our most powerful plan ever.
					</p>
				</header>

				<div className="feature-upsell__cta">
					<button
						onClick={ this.handleUpgradeButtonClick }
						className="button is-primary feature-upsell__cta-button"
					>
						Click here to upgrade your site to the Business plan now!
					</button>
				</div>

				<h2 className="feature-upsell__section-header">
					Upgrade today to unlock these incredible Business plan features:
				</h2>

				<div className="product-purchase-features-list">
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="Plugins" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
							title="Install as Many WordPress Plugins as You Want"
							description="Plugins are like smartphone apps for WordPress. They improve your site with features like:  SEO and marketing tools, lead generation tools, appointment booking and management, SalesForce and MailChimp integration, Google Analytics, and much, much more."
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="Themes" src="/calypso/images/illustrations/jetpack-themes.svg" /> }
							title="Access our Entire Library of Premium Themes"
							description="Professional site designs can be expensive, so we’ve negotiated deals on your behalf with many of the most prominent WordPress theme designers in the world. As a Business plan customer, you’ll gain access to our entire library of 197 premium site themes for no additional fee."
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={
								<img alt="Concierge" src="/calypso/images/illustrations/jetpack-concierge.svg" />
							}
							title="A Free 30 minute Consultation with a Website Expert"
							description="One of our highly-trained specialists will join you for a 30 minute call to help you get started. Whether you have questions about marketing, design, or anything in between, you’ll get plenty of guidance during this free call."
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-support.svg" /> }
							title="Unlimited 24/7 Design and Tech Support"
							description="In addition to the 30 minute call, the Business plan upgrade includes unlimited access to our world-class live chat and email support. No matter how complicated your question, our team will find you an answer, guaranteed."
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-payments.svg" /> }
							title={
								<span>
									Easily Accept Credit Card Payments with <i>Simple Payments</i>
								</span>
							}
							description={
								<span>
									The Simple Payments feature lets you accept credit card payments right on your
									site. Whether you’re selling products or services, collecting membership fees, or
									receiving donations, you’ll have a secure checkout process that you can turn on
									with the click of a button.
								</span>
							}
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="" src="/calypso/images/illustrations/jetpack-updates.svg" /> }
							title="World-class SEO Tools Built-In"
							description="The Business plan comes with advanced search engine optimization (SEO) tools that automatically “bake in” the most important SEO best practices. If you want to get as much search engine traffic as possible, the Business plan is for you"
						/>
					</div>
				</div>
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		trackTracksEvent: recordTracksEvent,
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
	};
};

export default connect( mapStateToProps )( localize( PluginsUpsellComponent ) );
