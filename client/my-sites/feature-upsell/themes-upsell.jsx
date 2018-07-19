/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlan, getPlanPath } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import page from 'page';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import PurchaseDetail from 'components/purchase-detail';
import { getCurrencyObject } from 'lib/format-currency';

/*
 * This is just for english audience and is not translated on purpose, remember to add
 * translate() calls before removing a/b test check and enabling it for everyone
 */
class ThemesUpsellComponent extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string.isRequired,
		price: PropTypes.number,
		trackTracksEvent: PropTypes.func.isRequired,
	};

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_upsell_landing_page_cta_click', {
			cta_name: 'themes-upsell',
		} );

		page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( PLAN_BUSINESS ) || '' }` );
	};

	formatPrice( price ) {
		const priceObject = getCurrencyObject( price, this.props.currencyCode );
		if ( price.toFixed( 5 ).split( '.' )[ 1 ] !== '00000' ) {
			return `${ priceObject.symbol }${ priceObject.integer }${ priceObject.fraction }`;
		}
		return `${ priceObject.symbol }${ priceObject.integer }`;
	}

	getPlanMonthlyPrice() {
		const { price } = this.props;
		return price ? this.formatPrice( price / 12 ) : '';
	}

	getPlanDailyPrice() {
		const { price } = this.props;
		return price ? this.formatPrice( price / 366 ) : '';
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		return (
			<div
				role="main"
				className="main is-wide-layout feature-upsell__main feature-upsell__main--themes"
			>
				<PageViewTracker path={ '/feature/plugins/:site' } title="PluginsUpsell" />
				<DocumentHead title={ 'Plugins' } />

				<div className="feature-upsell__text-content">
					<header className="feature-upsell__header">
						<h1 className="feature-upsell__header-title">Use any theme with a Business plan</h1>
						<p className="feature-upsell__header-subtitle">
							Customize your site with your own theme, gain access to thousands of plugins, and
							start getting more traffic today! We’ll even help you get started.
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
				</div>

				<div className="product-purchase-features-list">
					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="Themes" src="/calypso/images/illustrations/jetpack-themes.svg" /> }
							title="Access our Entire Library of Premium Themes"
							description="Professional site designs can be expensive, so we’ve negotiated deals on your behalf with many of the most prominent WordPress theme designers in the world. As a Business plan customer, you’ll gain access to our entire library of 197 premium site themes for no additional fee."
						/>
					</div>

					<div className="product-purchase-features-list__item">
						<PurchaseDetail
							icon={ <img alt="Plugins" src="/calypso/images/illustrations/jetpack-apps.svg" /> }
							title="Install as Many WordPress Plugins as You Want"
							description="Plugins are like smartphone apps for WordPress. They improve your site with features like:  SEO and marketing tools, lead generation tools, appointment booking and management, SalesForce and MailChimp integration, Google Analytics, and much, much more."
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
									The <i>Simple Payments</i> feature lets you accept credit card payments right on
									your site. Whether you’re selling products or services, collecting membership
									fees, or receiving donations, you’ll have a secure checkout process that you can
									turn on with the click of a button.
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

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__section-header">
						Upgrade to the Business plan today for just { this.getPlanMonthlyPrice() } per month.
					</h2>

					<p>
						For less than { this.getPlanDailyPrice() } per day, you’ll gain access to all of the
						features described above. And that list includes just a few of the highlights.
					</p>

					<h2 className="feature-upsell__section-header">
						The Business plan also includes features like:
					</h2>

					<div className="feature-upsell__list-wrapper">
						<ul className="feature-upsell__list">
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">A free custom domain name.</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">Unlimited bandwidth.</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">
									Advanced design and CSS customization.
								</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">Unlimited storage space.</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">
									$100 advertising credit to Google AdWords.
								</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">Unlimited video hosting.</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">
									Instant access to the WordAds ad platform.
								</span>
							</li>
							<li className="feature-upsell__list-item">
								<Gridicon icon="checkmark" className="feature-upsell__list-item-icon" />
								<span className="feature-upsell__list-item-text">
									Social media marketing tools.
								</span>
							</li>
						</ul>
					</div>

					<p>
						If you’re serious about your site, you owe it to yourself to try the WordPress.com
						Business plan. And thanks to our full money-back guarantee, you can try it out for
						yourself completely risk free.
					</p>

					<h2 className="feature-upsell__section-header">
						You’re protected by our 30 Day full money-back guarantee
					</h2>

					<p>
						Your Business plan upgrade comes with our 30 day money-back guarantee. So if you decide
						to not keep the Business plan for any reason, just let us know at any point during the
						first 30 days and we’ll give you a full refund.
					</p>

					<p>
						If you accept our offer for a free domain, and you later decide that the Business plan
						isn’t for you, the domain is yours keep. All we ask is that you to cover the domain
						registration fees.
					</p>

					<div className="feature-upsell__cta">
						<button
							onClick={ this.handleUpgradeButtonClick }
							className="button is-primary feature-upsell__cta-button"
						>
							Click here to upgrade your site to the Business plan now!
						</button>
					</div>
				</div>
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );
	const currentPlan = getPlan( PLAN_BUSINESS );
	const currentPlanId = currentPlan.getProductId();
	const rawPrice = getPlanRawPrice( state, currentPlanId, false );
	const discountedRawPrice = getPlanDiscountedRawPrice( state, selectedSiteId, PLAN_BUSINESS, {
		isMonthly: false,
	} );
	const price = discountedRawPrice || rawPrice;

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		price,
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
		trackTracksEvent: recordTracksEvent,
	};
};

export default connect( mapStateToProps )( localize( ThemesUpsellComponent ) );
