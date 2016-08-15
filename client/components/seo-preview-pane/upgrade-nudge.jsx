/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { compact, noop } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSectionName, getSelectedSite } from 'state/ui/selectors';
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

const AdvancedSEOUpgradeNudge = ( { translate, site, post } ) => {
	// <div className="seo-preview-nudge__upgrade">
	// 	<UpgradeNudge
	// 		title={ translate( 'Advanced SEO' ) }
	// 		message={ translate( 'lorem ipsum dolor sit amet' ) }
	// 		feature="advanced-seo"
	// 		event="advanced_seo_preview"
	// 		icon="share"
	// 	/>
	// </div	>

	return (
		<div className="seo-preview-nudge">
			<div className="seo-preview-nudge__plan">
				<div className="seo-preview-nudge__plan-icon"></div>
			</div>
			<div className="seo-preview-nudge__message">
				<h2 className="seo-preview-nudge__message-title">{ translate( 'Get Advanced SEO Features' ) }</h2>
				<h3 className="seo-preview-nudge__message-line">{ translate( 'Adds tools to enhance your site\'s content for better results on search engines and social media.' ) }</h3>
			</div>
			<div className="seo-preview-nudge__preview">
				<img src="/calypso/images/advanced-seo-nudge.png" />
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

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const postId = getEditorPostId( state );
	const isEditorShowing = 'post-editor' === getSectionName( state );

	return {
		site,
		post: isEditorShowing && getSitePost( state, site.ID, postId )
	};
};

export default connect( mapStateToProps )( localize( AdvancedSEOUpgradeNudge ) );
