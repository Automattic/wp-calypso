/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import PlanFeatures from 'my-sites/plan-features';
import {
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';
import { isEnabled } from 'config';
import purchasesPaths from 'me/purchases/paths';

class PlansFeaturesMain extends Component {
	getPlanFeatures() {
		const {
			site,
			intervalType,
			onUpgradeClick,
			hideFreePlan,
			isInSignup,
			isLandingPage,
			basePlansPath,
			selectedFeature,
			displayJetpackPlans
		} = this.props;

		const isPersonalPlanEnabled = isEnabled( 'plans/personal-plan' );
		if ( displayJetpackPlans && intervalType === 'monthly' ) {
			const jetpackPlans = [
				PLAN_JETPACK_FREE,
				PLAN_JETPACK_PERSONAL_MONTHLY,
				PLAN_JETPACK_PREMIUM_MONTHLY,
				PLAN_JETPACK_BUSINESS_MONTHLY
			];
			if ( hideFreePlan ) {
				jetpackPlans.shift();
			}
			return (
				<div className="plans-features-main__group" data-e2e-plans="jetpack">
					<PlanFeatures
						plans={ jetpackPlans }
						selectedFeature={ selectedFeature }
						onUpgradeClick={ onUpgradeClick }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						basePlansPath={ basePlansPath }
						intervalType={ intervalType }
						site={ site }
					/>
				</div>
			);
		}

		if ( displayJetpackPlans ) {
			const jetpackPlans = [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS ];
			if ( hideFreePlan ) {
				jetpackPlans.shift();
			}
			return (
				<div className="plans-features-main__group" data-e2e-plans="jetpack">
					<PlanFeatures
						plans={ jetpackPlans }
						selectedFeature={ selectedFeature }
						onUpgradeClick={ onUpgradeClick }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						basePlansPath={ basePlansPath }
						intervalType={ intervalType }
						site={ site }
					/>
				</div>
			);
		}

		const plans = filter(
			[
				hideFreePlan ? null : PLAN_FREE,
				isPersonalPlanEnabled ? PLAN_PERSONAL : null,
				PLAN_PREMIUM,
				PLAN_BUSINESS
			],
			value => !! value
		);

		return (
			<div className="plans-features-main__group" data-e2e-plans="wpcom">
				<PlanFeatures
					plans={ plans }
					onUpgradeClick={ onUpgradeClick }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					basePlansPath={ basePlansPath }
					selectedFeature={ selectedFeature }
					intervalType={ intervalType }
					site={ site }
				/>
			</div>
		);
	}

	getJetpackFAQ() {
		const { translate } = this.props;

		return (
			<FAQ>
				<FAQItem
					question={ translate( 'I signed up and paid. What’s next?' ) }
					answer={ translate(
						'Our premium features are powered by a few of our other plugins. After purchasing you will' +
						' need to install the Akismet and VaultPress plugins. Just follow the guide' +
						' after you complete your purchase.'
					) }
				/>

				<FAQItem
					question={ translate( 'What are the hosting requirements?' ) }
					answer={ translate(
						'You should be running the latest version of WordPress and be using a web host that runs' +
						' PHP 5 or higher. You will also need a WordPress.com account (you can register' +
						' during the connection process) and a publicly-accessible site with XML-RPC enabled.'
					) }
				/>

				<FAQItem
					question={ translate( 'Does this work with a multisite network?' ) }
					answer={ translate(
						'Yes, Jetpack and all of its premium features are compatible with WordPress Multisite' +
						' networks. If you manage a Multisite network you will need to make sure you have a' +
						' subscription for each site you wish to cover with premium features.'
					) }
				/>

				<FAQItem
					question={ translate( 'Why do I need a WordPress.com account?' ) }
					answer={ translate(
						"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure" +
						' everything works correctly, Jetpack requires you to connect a (free) WordPress.com' +
						" account. If you don't already have an account you can easily create one during the" +
						' connection process.'
					) }
				/>

				<FAQItem
					question={ translate( 'Can I migrate my subscription to a different site?' ) }
					answer={ translate(
						'Absolutely. You are always free to activate your premium services on a different' +
						' WordPress site.'
					) }
				/>

				<FAQItem
					question={ translate( 'What is the cancellation policy?' ) }
					answer={ translate(
						'You can request a cancellation within 30 days of purchase and receive a full refund.'
					) }
				/>

				<FAQItem
					question={ translate( 'Have more questions?' ) }
					answer={ translate(
						'No problem! Feel free to {{a}}get in touch{{/a}} with our Happiness Engineers.',
						{
							components: { a: <a href="https://jetpack.com/contact-support/" target="_blank" rel="noopener noreferrer" /> }
						}
					) }
				/>
			</FAQ>

		);
	}

	getFAQ() {
		const { site, translate } = this.props;

		return (
			<FAQ>
				<FAQItem
					question={ translate( 'Do you sell domains?' ) }
					answer={ translate(
						'Yes! The personal, premium, and business plans include a free custom domain. That includes new' +
						' domains purchased through WordPress.com or your own existing domain that you can map' +
						' to your WordPress.com site. {{a}}Find out more about domains.{{/a}}',
						{
							components: {
								a: <a
									href="https://en.support.wordpress.com/all-about-domains/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							}
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Can I upload my own plugins?' ) }
					answer={ translate(
						'While uploading your own plugins is not available on WordPress.com, we include the most' +
						' popular plugin functionality within our sites automatically. The premium and business' +
						' plans even include their own set of plugins suites tailored just' +
						' for them. {{a}}Check out all included plugins{{/a}}.',
						{
							components: { a: <a href={ `/plugins/${ site.slug }` } /> }
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Can I install my own theme?' ) }
					answer={ translate(
						'We don’t currently allow custom themes to be uploaded to WordPress.com. We do this to keep' +
						' your site secure but all themes in our {{a}}theme directory{{/a}} have been reviewed' +
						' by our team and represent the highest quality. The business plan even supports' +
						' unlimited premium theme access.',
						{
							components: { a: <a href={ `/themes/${ site.slug }` } /> }
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Do I need another web host?' ) }
					answer={ translate(
						'No. All WordPress.com sites include our specially tailored WordPress hosting to ensure' +
						' your site stays available and secure at all times. You can even use your own domain' +
						' when you upgrade to the premium or business plan.'
					) }
				/>

				<FAQItem
					question={ translate( 'Do you offer email accounts?' ) }
					answer={ translate(
						'Yes. If you register a new domain with our premium or business plans, you can optionally' +
						' add G Suite. You can also set up email forwarding for any custom domain' +
						' registered through WordPress.com. {{a}}Find out more about email{{/a}}.',
						{
							components: {
								a: <a
									href="https://en.support.wordpress.com/add-email/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							}
						}
					) }
				/>

				<FAQItem
					question={ translate( 'What’s included with advanced custom design?' ) }
					answer={ translate(
						'Custom design is a toolset you can use to personalize your blog’s look and feel with' +
						' custom colors & backgrounds, custom fonts, and even a CSS editor that you can use for' +
						' more precise control of your site’s' +
						' design. {{a}}Find out more about custom design{{/a}}.',
						{
							components: {
								a: <a
									href="https://en.support.wordpress.com/custom-design/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							}
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Will upgrading affect my content?' ) }
					answer={ translate(
						'Plans add extra features to your site, but they do not affect the content of your site' +
						" or your site's followers. You will never lose content by upgrading or downgrading" +
						" your site's plan."
					) }
				/>

				<FAQItem
					question={ translate( 'Can I cancel my subscription?' ) }
					answer={ translate(
						'Yes. We want you to love everything you do at WordPress.com, so we provide a 30-day' +
						' refund on all of our plans. {{a}}Manage purchases{{/a}}.',
						{
							components: { a: <a href={ purchasesPaths.purchasesRoot() } /> }
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Have more questions?' ) }
					answer={ translate(
						'Need help deciding which plan works for you? Our happiness engineers are available for' +
						' any questions you may have. {{a}}Get help{{/a}}.',
						{
							components: { a: <a href="https://wordpress.com/help" target="_blank" rel="noopener noreferrer" /> }
						}
					) }
				/>
			</FAQ>
		);
	}

	render() {
		const {
			site,
			showFAQ,
			displayJetpackPlans
		} = this.props;

		const renderFAQ = () =>
			displayJetpackPlans
				? this.getJetpackFAQ()
				: this.getFAQ( site );

		return (
			<div className="plans-features-main">
				<QueryPlans />
				<QuerySitePlans siteId={ get( site, 'ID' ) } />
				{ this.getPlanFeatures() }

				{
					showFAQ
						? renderFAQ()
						: null
				}
			</div>
		);
	}
}

PlansFeaturesMain.propTypes = {
	site: PropTypes.object,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	basePlansPath: PropTypes.string,
	intervalType: PropTypes.string,
	onUpgradeClick: PropTypes.func,
	hideFreePlan: PropTypes.bool,
	showFAQ: PropTypes.bool,
	selectedFeature: PropTypes.string,
	displayJetpackPlans: PropTypes.bool.isRequired
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	intervalType: 'yearly',
	hideFreePlan: false,
	site: {},
	showFAQ: true
};

export default localize( PlansFeaturesMain );
