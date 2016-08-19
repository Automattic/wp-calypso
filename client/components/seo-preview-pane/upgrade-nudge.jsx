/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import FeatureExample from 'components/feature-example';
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import { preventWidows } from 'lib/formatting';
import { getFeatureTitle, planHasFeature, getPlan } from 'lib/plans';
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

const AdvancedSEOUpgradeNudge = ( { translate, site } ) => {
	return (
		<div className="seo-preview-nudge">
			<div className="seo-preview-nudge__upgrade">
				<UpgradeNudge
					title={ translate( 'Get Advanced SEO Features' ) }
					message={ translate( 'Adds tools to enhance your site\'s content for better results on search engines and social media.' ) }
					feature="advanced-seo"
					event="advanced_seo_preview"
					icon="share"
				/>
			</div>
			<div className="seo-preview-nudge__plan">
				<div className="seo-preview-nudge__plan-icon"></div>
			</div>
			<h2 className="seo-preview-nudge__title">{ translate( 'Advanced SEO Features' ) }</h2>
			<div className="seo-preview-nudge__features">
				<FeatureExample>
					<img src="/calypso/images/advanced-seo-nudge.png" />
				</FeatureExample>
				<div className="seo-form-nudge__features-details">
					<p className="seo-form-nudge__features-title">
						{ translate( 'By upgrading to a Business Plan you\'ll enable advanced SEO features on your site.' ) }
					</p>
					<ul className="seo-form-nudge__features-list">
						<li className="seo-form-nudge__features-list-item">
							<Gridicon className="seo-form-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Preview your site\'s posts and pages as they will appear when shared on Facebook, Twitter and the WordPress.com Reader.' ) ) }
						</li>
						<li className="seo-form-nudge__features-list-item">
							<Gridicon className="seo-form-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Allow you to control how page titles will appear on Google search results, or when shared on social networks.' ) ) }
						</li>
						<li className="seo-form-nudge__features-list-item">
							<Gridicon className="seo-form-nudge__features-list-item-checkmark" icon="checkmark" />
							{ preventWidows( translate( 'Modify front page meta data in order to customize how your site appears to search engines.' ) ) }
						</li>
					</ul>
				</div>
			</div>
			<FeatureComparison className="seo-preview-nudge__feature-comparison">
				<PlanCompareCard
					title={ getPlan( site.plan.product_slug ).getTitle() }
					line={ getPlan( site.plan.product_slug ).getPriceTitle() }
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
					title={ getPlan( PLAN_BUSINESS ).getTitle() }
					line={ getPlan( PLAN_BUSINESS ).getPriceTitle() }
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
}

export default localize( AdvancedSEOUpgradeNudge );
