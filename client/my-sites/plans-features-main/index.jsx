/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import PlanFeatures from 'my-sites/plan-features';
import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';
import { abtest } from 'lib/abtest';

class PlansFeaturesMain extends Component {
	renderPlanPlaceholders() {
		const { site, hideFreePlan, showJetpackFreePlan } = this.props;

		let numberOfPlaceholders = abtest( 'personalPlan' ) === 'hide' ? 3 : 4;

		if ( hideFreePlan || ( site && site.jetpack ) ) {
			numberOfPlaceholders = showJetpackFreePlan ? 3 : 2;
		}

		const plansList = times( numberOfPlaceholders, ( n ) => {
			return (
				<PlanFeatures key={ n } placeholder={ true } />
			);
		} );

		return (
			<div className="plans-features-main">
				{ plansList }
			</div>
		);
	}

	render() {
		const { translate, site, plans, isInSignup, sitePlans } = this.props;

		const isLoadingSitePlans = ! isInSignup && ! sitePlans.hasLoadedFromServer;

		if ( plans.length === 0 || isLoadingSitePlans ) {
			return this.renderPlanPlaceholders();
		}

		return (
			<div>
				<div className="plans-features-main">
					<PlanFeatures plan={ PLAN_FREE } /* onClick={ this.upgradePlan } */ />
					<PlanFeatures plan={ PLAN_PREMIUM } /* onClick={ this.upgradePlan } */ />
					<PlanFeatures plan={ PLAN_BUSINESS } /* onClick={ this.upgradePlan } */ />
				</div>
				<FAQ>
					<FAQItem
						question={ translate( 'Do you sell domains?' ) }
						answer={ translate(
							'Yes! The premium and business plans include a free custom domain. That includes new domains purchased through WordPress.com or your own existing domain that you can map to your WordPress.com site. {{a}}Find out more about domains.{{/a}}',
							{
								components: { a: <a href="https://en.support.wordpress.com/all-about-domains/" target="_blank" /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'Can I upload my own plugins?' ) }
						answer={ translate(
							'While uploading your own plugins is not available on WordPress.com, we include the most popular plugin functionality within our sites automatically. The premium and business plans even include their own set of plugins suites tailored just for them. {{a}}Check out all included plugins{{/a}}.',
							{
								components: { a: <a href={ `/plugins/${ site.slug }` } /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'Can I install my own theme?' ) }
						answer={ translate(
							'We don’t currently allow custom themes to be uploaded to WordPress.com. We do this to keep your site secure but all themes in our {{a}}theme directory{{/a}} have been reviewed by our team and represent the highest quality. The business plan even supports unlimited premium theme access.',
							{
								components: { a: <a href={ `/design/${ site.slug }` } /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'Do I need another web host?' ) }
						answer={ translate(
							'No. All WordPress.com sites include our specially tailored WordPress hosting to ensure your site stays available and secure at all times. You can even use your own domain when you upgrade to the premium or business plan.'
						) }
					/>

					<FAQItem
						question={ translate( 'Do you offer email accounts?' ) }
						answer={ translate(
							'Yes. If you register a new domain with our premium or business plans, you can optionally add Google apps for work. You can also set up email forwarding for any custom domain registered through WordPress.com. {{a}}Find out more about email{{/a}}.',
							{
								components: { a: <a href="https://en.support.wordpress.com/add-email/" target="_blank" /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'What’s included with advanced custom design?' ) }
						answer={ translate(
							'Custom design is a toolset you can use to personalize your blog’s look and feel with custom colors & backgrounds, custom fonts, and even a CSS editor that you can use for more precise control of your site’s design. {{a}}Find out more about custom design{{/a}}.',
							{
								components: { a: <a href="https://en.support.wordpress.com/custom-design/" target="_blank" /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'Can I cancel my subscription?' ) }
						answer={ translate(
							'Yes. We want you to love everything you do at WordPress.com, so we provide a 30-day refund on all of our plans. {{a}}Manage purchases{{/a}}.',
							{
								// TODO: needs correct url
								components: { a: <a href={ `#` } /> }
							}
						) }
					/>

					<FAQItem
						question={ translate( 'Have more questions?' ) }
						answer={ translate(
							'Need help deciding which plan works for you? Our hapiness engineers are available for any questions you may have. {{a}}Get help{{/a}}.',
							{
								components: { a: <a href="https://wordpress.com/help" target="_blank" /> }
							}
						) }
					/>
				</FAQ>
			</div>
		);
	}
}

export default localize( PlansFeaturesMain );
