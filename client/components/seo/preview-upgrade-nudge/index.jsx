/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import QueryPlans from 'components/data/query-plans';
import Gridicon from 'components/gridicon';
import FeatureExample from 'components/feature-example';
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import { preventWidows } from 'lib/formatting';
import formatCurrency from 'lib/format-currency';
import { getFeatureTitle, planHasFeature } from 'lib/plans';
import { isFreePlan } from 'lib/products-values';
import { getPlanBySlug } from 'state/plans/selectors';
import {
	PLAN_BUSINESS,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_NO_ADS,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_VIDEO_UPLOADS
} from 'lib/plans/constants';

const featuresToShow = [
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_NO_ADS,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_VIDEO_UPLOADS
];

const SeoPreviewNudge = ( { translate, site, plan = {}, businessPlan = {} } ) => {
	const planPrice = isFreePlan( plan )
		? translate( 'Free for life' )
		: translate( '%(price)s per month, billed yearly', {
			args: {
				price: formatCurrency( plan.raw_price / 12, plan.currency_code )
			}
		} );
	const businessPlanPrice = formatCurrency( businessPlan.raw_price / 12, businessPlan.currency_code );

	return (
		<div className="preview-upgrade-nudge">
			<QueryPlans />
			<div className="preview-upgrade-nudge__plan">
				<div className="preview-upgrade-nudge__plan-icon"></div>
			</div>
			<h2 className="preview-upgrade-nudge__title">{ translate( 'Advanced SEO Features' ) }</h2>
			<div className="preview-upgrade-nudge__features">
				<FeatureExample>
					<img src="/calypso/images/advanced-seo-nudge.png" />
				</FeatureExample>
				<div className="preview-upgrade-nudge__features-details">
					<p className="preview-upgrade-nudge__features-title">
						{ translate( 'By upgrading to a Business Plan you\'ll enable advanced SEO features on your site.' ) }
					</p>
					<ul className="preview-upgrade-nudge__features-list">
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon className="preview-upgrade-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Preview your site\'s posts and pages as they will appear when shared on Facebook, Twitter and the WordPress.com Reader.' ) ) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon className="preview-upgrade-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Allow you to control how page titles will appear on Google search results, or when shared on social networks.' ) ) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon className="preview-upgrade-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Modify front page meta data in order to customize how your site appears to search engines.' ) ) }
						</li>
					</ul>
				</div>
			</div>
			<FeatureComparison className="preview-upgrade-nudge__feature-comparison">
				<PlanCompareCard
					title={ plan.product_name_short }
					line={ planPrice }
					buttonName={ translate( 'Your Plan' ) }
					currentPlan={ true } >
					<PlanCompareCardItem unavailable={ true } >
						{ translate( 'Advanced SEO' ) }
					</PlanCompareCardItem>
					{ featuresToShow.map( feature => (
						<PlanCompareCardItem
							key={ feature }
							unavailable={ ! planHasFeature( site.plan.product_slug, feature ) } >
							{ getFeatureTitle( feature ) }
						</PlanCompareCardItem>
					) ) }
				</PlanCompareCard>
				<PlanCompareCard
					title={ businessPlan.product_name_short }
					line={ translate( '%(price)s per month, billed yearly', { args: { price: businessPlanPrice } } ) }
					buttonName={ translate( 'Upgrade' ) }
					onClick={ () => page( '/checkout/' + site.domain + '/business' ) }
					currentPlan={ false }
					popularRibbon={ true } >
					<PlanCompareCardItem highlight={ true } >
						{ translate( 'Advanced SEO' ) }
					</PlanCompareCardItem>
					{ featuresToShow.map( feature => (
						<PlanCompareCardItem key={ feature }>
							{ getFeatureTitle( feature ) }
						</PlanCompareCardItem>
					) ) }
				</PlanCompareCard>
			</FeatureComparison>
		</div>
	);
};

SeoPreviewNudge.propTypes = {
	translate: PropTypes.func.isRequired,
	site: PropTypes.object,
	plan: PropTypes.object,
	businessPlan: PropTypes.object
};

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;

	return {
		plan: getPlanBySlug( state, site.plan.product_slug ),
		businessPlan: getPlanBySlug( state, PLAN_BUSINESS )
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
