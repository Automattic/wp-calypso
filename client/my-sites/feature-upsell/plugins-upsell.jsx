/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { flowRight } from 'lodash';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanPath } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import page from 'page';
import { PLAN_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import Feature from 'my-sites/feature-upsell/feature';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import RefundAsterisk from 'my-sites/feature-upsell/refund-asterisk';
import { getUpsellPlanPrice, redirectUnlessCanUpgradeSite } from './utils';
import { hasFeature } from 'state/sites/plans/selectors';
import redirectIf from './redirect-if';

/*
 * This is just for english audience and is not translated on purpose, remember to add
 * translate() calls before removing a/b test check and enabling it for everyone
 */
class PluginsUpsellComponent extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string.isRequired,
		price: PropTypes.number,
		trackTracksEvent: PropTypes.func.isRequired,
	};

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_banner_cta_click', {
			cta_name: 'upsell-page-plugins',
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
		const { price } = this.props;
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main is-plugins">
				{ ! price && (
					<React.Fragment>
						<QueryPlans />
						<QuerySitePlans siteId={ this.props.selectedSiteId } />
						<QueryActivePromotions />
					</React.Fragment>
				) }

				<PageViewTracker path={ '/feature/plugins/:site' } title="PluginsUpsell" />
				<DocumentHead title={ 'Plugins' } />

				<div className="feature-upsell__card">
					<h1 className="feature-upsell__card-header is-capital is-main">
						WordPress Plugins are now available on the Business plan
					</h1>
					<h2 className="feature-upsell__card-header is-sub">
						Upgrading to the Business plan unlocks access to more thousands of WordPress plugins and
						themes, making it our most powerful plan ever.
					</h2>

					<div className="feature-upsell__cta">
						<button
							onClick={ this.handleUpgradeButtonClick }
							className="button is-primary feature-upsell__cta-button"
						>
							Click here to upgrade your site to the Business plan now!
						</button>
					</div>
				</div>

				<div className="feature-upsell__text-content">
					<h2 className="feature-upsell__header-section">
						Upgrade today to unlock these incredible Business plan features:
					</h2>
				</div>

				<div className="feature-upsell__features-list">
					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="plugins" size={ 48 } /> }
							title="Install as Many WordPress Plugins as You Want"
							description="Plugins are like smartphone apps for WordPress. They improve your site with features like: SEO and marketing tools, lead generation tools, appointment booking and management, SalesForce and Mailchimp integration, Google Analytics, and much, much more."
						/>
					</div>

					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="types" size={ 48 } /> }
							title="Access our Entire Library of Premium Themes"
							description="Professional site designs can be expensive, so we’ve negotiated deals on your behalf with many of the most prominent WordPress theme designers in the world. As a Business plan customer, you’ll gain access to our entire library of premium themes for no additional fee."
						/>
					</div>

					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="user" size={ 48 } /> }
							title="A Free 30 minute Consultation with a Website Expert"
							description="One of our highly-trained specialists will join you for a 30 minute call to help you get started. Whether you have questions about marketing, design, or anything in between, you’ll get plenty of guidance during this free call."
						/>
					</div>

					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="chat" size={ 48 } /> }
							title="Unlimited 24/7 Design and Tech Support"
							description="In addition to the 30 minute call, the Business plan upgrade includes unlimited access to our world-class live chat and email support. No matter how complicated your question, our team will find you an answer, guaranteed."
						/>
					</div>

					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="money" size={ 48 } /> }
							title="Easily Accept Credit Card Payments with Simple Payments"
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

					<div className="feature-upsell__features-list-item">
						<Feature
							icon={ <Gridicon icon="domains" size={ 48 } /> }
							title="World-class SEO Tools Built-In"
							description="The Business plan comes with advanced search engine optimization (SEO) tools that automatically “bake in” the most important SEO best practices. If you want to get as much search engine traffic as possible, the Business plan is for you"
						/>
					</div>
				</div>

				<div className="feature-upsell__card">
					<h2 className="feature-upsell__card-header is-title is-main">
						Upgrade to the Business plan today for just { this.getPlanMonthlyPrice() } per month.
					</h2>

					<h3 className="feature-upsell__card-header is-sub">
						For less than { this.getPlanDailyPrice() } per day, you’ll gain access to all of the
						features described above. And that list includes just a few of the highlights.
					</h3>

					<div className="feature-upsell__card-content">
						<p>The Business plan also includes features like:</p>

						<ul className="feature-upsell__checklist">
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									A free custom domain name for one year.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">Unlimited bandwidth.</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									Advanced design and CSS customization.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									Unlimited storage space.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									$100 advertising credit to Google AdWords.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									Unlimited video hosting.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									Instant access to the WordAds ad platform.
								</span>
							</li>
							<li className="feature-upsell__checklist-item">
								<Gridicon icon="checkmark-circle" className="feature-upsell__checklist-item-icon" />
								<span className="feature-upsell__checklist-item-text">
									Social media marketing tools.
								</span>
							</li>
						</ul>

						<p>
							If you’re serious about your site, you owe it to yourself to try the WordPress.com
							Business plan. And thanks to our full money-back guarantee, you can try it out for
							yourself completely risk free.
						</p>
					</div>
				</div>

				<div className="feature-upsell__card">
					<h1 className="feature-upsell__card-header is-sub is-main">
						You’re protected by our 30-day full money-back guarantee*
					</h1>

					<div className="feature-upsell__card-content">
						<p>
							Your Business plan upgrade comes with our 30-day money-back guarantee*. So if you
							decide to not keep the Business plan for any reason, just let us know at any point
							during the first 30 days and we’ll give you a full refund.
						</p>

						<p>
							If you accept our offer for a free domain, and you later decide that the Business plan
							isn’t for you, the domain is yours to keep. All we ask is that you cover the domain
							registration fees.
						</p>
					</div>
				</div>

				<div className="feature-upsell__cta is-centered is-large-gap">
					<button
						onClick={ this.handleUpgradeButtonClick }
						className="button is-primary feature-upsell__cta-button"
					>
						Click here to upgrade your site to the Business plan now!
					</button>
				</div>

				<RefundAsterisk />
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const price = getUpsellPlanPrice( state, PLAN_BUSINESS, selectedSiteId );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		price,
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
	redirectIf( ( state, siteId ) => hasFeature( state, siteId, FEATURE_UPLOAD_PLUGINS ), '/plugins' )
)( PluginsUpsellComponent );
