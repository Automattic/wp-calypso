/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import QueryPlans from 'components/data/query-plans';
import FeatureExample from 'components/feature-example';
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import TrackComponentView from 'lib/analytics/track-component-view';
import { preventWidows } from 'lib/formatting';
import formatCurrency from 'lib/format-currency';
import { getFeatureTitle, planHasFeature } from 'lib/plans';
import { isFreePlan, isFreeJetpackPlan } from 'lib/products-values';
import { isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getPlanBySlug } from 'state/plans/selectors';
import { getPlan } from 'lib/plans';
import {
	PLAN_BUSINESS,
	PLAN_JETPACK_BUSINESS,
	FEATURE_ADVANCED_SEO
} from 'lib/plans/constants';

const SeoPreviewNudge = ( { translate, domain, plan = {}, businessPlan = {}, isJetpack = false, planFeatures = [] } ) => {
	let planPrice = translate( 'Free for life' );
	if ( ! ( isFreePlan( plan ) || isFreeJetpackPlan( plan ) ) ) {
		planPrice = isJetpack
			? translate( '%(price)s per year', {
				args: {
					price: formatCurrency( plan.raw_price, plan.currency_code )
				}
			} )
			: translate( '%(price)s per month, billed yearly', {
				args: {
					price: formatCurrency( plan.raw_price / 12, plan.currency_code )
				}
			} );
	}
	const businessPlanPrice = isJetpack
		? formatCurrency( businessPlan.raw_price, businessPlan.currency_code )
		: formatCurrency( businessPlan.raw_price / 12, businessPlan.currency_code );
	const priceInfo = isJetpack
		? translate( '%(price)s per year', { args: { price: businessPlanPrice } } )
		: translate( '%(price)s per month, billed yearly', { args: { price: businessPlanPrice } } );

	const featuresToShow = planFeatures.filter(
		feature =>
			! planHasFeature( plan.product_slug, feature ) &&
			feature !== FEATURE_ADVANCED_SEO
	);
	return (
		<div className="preview-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_preview_upgrade_nudge_impression" />
			<div className="preview-upgrade-nudge__plan">
				<div className="preview-upgrade-nudge__plan-icon"></div>
			</div>
			<h2 className="preview-upgrade-nudge__title">{ translate( 'SEO Features' ) }</h2>
			<div className="preview-upgrade-nudge__features">
				<FeatureExample>
					<img src="/calypso/images/advanced-seo-nudge.png" />
				</FeatureExample>
				<div className="preview-upgrade-nudge__features-details">
					<p className="preview-upgrade-nudge__features-title">
						{ translate( 'By upgrading to a Business Plan you\'ll enable SEO Tools on your site.' ) }
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
					title={ plan.product_name_short || '' }
					line={ planPrice }
					buttonName={ translate( 'Your Plan' ) }
					currentPlan={ true } >
					<PlanCompareCardItem unavailable={ true } >
						{ getFeatureTitle( FEATURE_ADVANCED_SEO ) }
					</PlanCompareCardItem>
					{ featuresToShow.map( feature => (
						<PlanCompareCardItem
							key={ feature }
							unavailable={ ! planHasFeature( plan.product_slug, feature ) } >
							{ getFeatureTitle( feature ) }
						</PlanCompareCardItem>
					) ) }
				</PlanCompareCard>
				<PlanCompareCard
					title={ businessPlan.product_name_short || '' }
					line={ priceInfo }
					buttonName={ translate( 'Upgrade' ) }
					onClick={ () => {
						recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
							cta_size: 'expanded',
							cta_name: 'calypso_seo_preview_upgrade_nudge',
							cta_feature: FEATURE_ADVANCED_SEO
						} );
						page( '/checkout/' + domain + ( isJetpack ? '/professional' : '/business' ) );
					} }
					currentPlan={ false }
					popularRibbon={ true } >
					<PlanCompareCardItem highlight={ true } >
						{ getFeatureTitle( FEATURE_ADVANCED_SEO ) }
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
	domain: PropTypes.string.isRequired,
	plan: PropTypes.object,
	businessPlan: PropTypes.object
};

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;
	const isJetpack = isJetpackSite( state, site.ID );

	return {
		domain: site.domain,
		plan: getPlanBySlug( state, site.plan.product_slug ),
		businessPlan: getPlanBySlug( state, isJetpack ? PLAN_JETPACK_BUSINESS : PLAN_BUSINESS ),
		isJetpack,
		planFeatures: getPlan( isJetpack ? PLAN_JETPACK_BUSINESS : PLAN_BUSINESS ).getFeatures()
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
