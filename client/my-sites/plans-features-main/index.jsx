/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { filter, get } from 'lodash';
import classNames from 'classnames';

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
import { addQueryArgs } from 'lib/url';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';
import { isEnabled } from 'config';
import { purchasesRoot } from 'me/purchases/paths';
import { plansLink } from 'lib/plans';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import PaymentMethods from 'blocks/payment-methods';

class PlansFeaturesMain extends Component {
	getPlanFeatures() {
		const {
			basePlansPath,
			displayJetpackPlans,
			domainName,
			hideFreePlan,
			intervalType,
			isInSignup,
			isLandingPage,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			site,
		} = this.props;

		const isPersonalPlanEnabled = isEnabled( 'plans/personal-plan' );
		if ( displayJetpackPlans && intervalType === 'monthly' ) {
			const jetpackPlans = [
				PLAN_JETPACK_FREE,
				PLAN_JETPACK_PERSONAL_MONTHLY,
				PLAN_JETPACK_PREMIUM_MONTHLY,
				PLAN_JETPACK_BUSINESS_MONTHLY,
			];
			if ( hideFreePlan ) {
				jetpackPlans.shift();
			}
			return (
				<div className="plans-features-main__group" data-e2e-plans="jetpack">
					<PlanFeatures
						basePlansPath={ basePlansPath }
						displayJetpackPlans={ displayJetpackPlans }
						domainName={ domainName }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						onUpgradeClick={ onUpgradeClick }
						plans={ jetpackPlans }
						selectedFeature={ selectedFeature }
						selectedPlan={ selectedPlan }
						site={ site }
					/>
				</div>
			);
		}

		if ( displayJetpackPlans ) {
			const jetpackPlans = [
				PLAN_JETPACK_FREE,
				PLAN_JETPACK_PERSONAL,
				PLAN_JETPACK_PREMIUM,
				PLAN_JETPACK_BUSINESS,
			];
			if ( hideFreePlan ) {
				jetpackPlans.shift();
			}
			return (
				<div className="plans-features-main__group" data-e2e-plans="jetpack">
					<PlanFeatures
						basePlansPath={ basePlansPath }
						displayJetpackPlans={ displayJetpackPlans }
						domainName={ domainName }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						onUpgradeClick={ onUpgradeClick }
						plans={ jetpackPlans }
						selectedFeature={ selectedFeature }
						selectedPlan={ selectedPlan }
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
				PLAN_BUSINESS,
			],
			value => !! value
		);

		return (
			<div className="plans-features-main__group" data-e2e-plans="wpcom">
				<PlanFeatures
					basePlansPath={ basePlansPath }
					displayJetpackPlans={ displayJetpackPlans }
					domainName={ domainName }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
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
							components: {
								a: (
									<a
										href="https://jetpack.com/contact-support/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
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
						'Yes! The Personal, Premium, and Business plans include a free custom domain. That includes new' +
							' domains purchased through WordPress.com or your own existing domain that you can map' +
							' to your WordPress.com site. Does not apply to premium domains. {{a}}Find out more about domains.{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://en.support.wordpress.com/all-about-domains/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Can I install plugins?' ) }
					answer={ translate(
						'Yes! With the WordPress.com Business plan you can search for and install external plugins.' +
							' All plans already come with a custom set of plugins tailored just for them.' +
							' {{a}}Check out all included plugins{{/a}}.',
						{
							components: { a: <a href={ `/plugins/${ site.slug }` } /> },
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Can I upload my own theme?' ) }
					answer={ translate(
						"Yes! With the WordPress.com Business plan you can upload any theme you'd like." +
							' All plans give you access to our {{a}}directory of free and premium themes{{/a}}.' +
							' These are among the highest-quality WordPress themes, hand-picked and reviewed by our team.',
						{
							components: { a: <a href={ `/themes/${ site.slug }` } /> },
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Do I need another web host?' ) }
					answer={ translate(
						'No. All WordPress.com sites include our specially tailored WordPress hosting to ensure' +
							' your site stays available and secure at all times. You can even use your own domain' +
							' when you upgrade to the Personal, Premium, or Business plan.'
					) }
				/>

				<FAQItem
					question={ translate( 'Do you offer email accounts?' ) }
					answer={ translate(
						'Yes. If you register a new domain with our Personal, Premium, or Business plans, you can' +
							' add Google-powered G Suite. You can also set up email forwarding for any custom domain' +
							' registered through WordPress.com. {{a}}Find out more about email{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://en.support.wordpress.com/add-email/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
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
								a: (
									<a
										href="https://en.support.wordpress.com/custom-design/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Will upgrading affect my content?' ) }
					answer={ translate(
						'Plans add extra features to your site, but they do not affect the content of your site' +
							" or your site's followers."
					) }
				/>

				<FAQItem
					question={ translate( 'Can I cancel my subscription?' ) }
					answer={ translate(
						'Yes. We want you to love everything you do at WordPress.com, so we provide a 30-day' +
							' refund on all of our plans. {{a}}Manage purchases{{/a}}.',
						{
							components: { a: <a href={ purchasesRoot } /> },
						}
					) }
				/>

				<FAQItem
					question={ translate( 'Have more questions?' ) }
					answer={ translate(
						'Need help deciding which plan works for you? Our happiness engineers are available for' +
							' any questions you may have. {{a}}Get help{{/a}}.',
						{
							components: {
								a: (
									<a href="https://wordpress.com/help" target="_blank" rel="noopener noreferrer" />
								),
							},
						}
					) }
				/>
			</FAQ>
		);
	}

	constructPath( plansUrl, intervalType ) {
		const { selectedFeature, selectedPlan, site } = this.props;
		return addQueryArgs(
			{
				feature: selectedFeature,
				plan: selectedPlan,
			},
			plansLink( plansUrl, site, intervalType )
		);
	}

	getIntervalTypeToggle() {
		const { basePlansPath, intervalType, translate } = this.props;
		const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle' );

		let plansUrl = '/plans';

		if ( basePlansPath ) {
			plansUrl = basePlansPath;
		}

		return (
			<SegmentedControl compact className={ segmentClasses } primary={ true }>
				<SegmentedControlItem
					selected={ intervalType === 'monthly' }
					path={ this.constructPath( plansUrl, 'monthly' ) }
				>
					{ translate( 'Monthly billing' ) }
				</SegmentedControlItem>

				<SegmentedControlItem
					selected={ intervalType === 'yearly' }
					path={ this.constructPath( plansUrl, 'yearly' ) }
				>
					{ translate( 'Yearly billing' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	}

	render() {
		const { site, displayJetpackPlans, isInSignup } = this.props;

		const renderFAQ = () => ( displayJetpackPlans ? this.getJetpackFAQ() : this.getFAQ( site ) );
		let faqs = null;

		if ( ! isInSignup ) {
			faqs = renderFAQ();
		}

		return (
			<div className="plans-features-main">
				<div className="plans-features-main__notice" />
				{ displayJetpackPlans ? this.getIntervalTypeToggle() : null }
				<QueryPlans />
				<QuerySitePlans siteId={ get( site, 'ID' ) } />
				{ this.getPlanFeatures() }
				<PaymentMethods />
				{ faqs }
				<div className="plans-features-main__bottom" />
			</div>
		);
	}
}

PlansFeaturesMain.propTypes = {
	basePlansPath: PropTypes.string,
	displayJetpackPlans: PropTypes.bool.isRequired,
	hideFreePlan: PropTypes.bool,
	intervalType: PropTypes.string,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	showFAQ: PropTypes.bool,
	site: PropTypes.object,
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	intervalType: 'yearly',
	site: {},
	showFAQ: true,
};

export default localize( PlansFeaturesMain );
