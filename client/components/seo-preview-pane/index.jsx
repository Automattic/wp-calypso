/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	overSome,
	noop
} from 'lodash';

/**
 * Internal dependencies
 */
import Sidebar from './sidebar';
import PreviewArea from './preview-area';
// import UpgradeNudge from 'my-sites/upgrade-nudge';
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import { isBusiness, isEnterprise } from 'lib/products-values';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSeoTitle } from 'state/sites/selectors';
import {
	getSectionName,
	getSelectedSite
} from 'state/ui/selectors';
import {
	PLAN_BUSINESS,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_NO_ADS,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_VIDEO_UPLOADS
} from 'lib/plans/constants';
import {
	getFeatureTitle,
	planHasFeature,
	getPlan
} from 'lib/plans';

const hasBusinessPlan = overSome( isBusiness, isEnterprise );

export class SeoPreviewPane extends PureComponent {
	constructor( props ) {
		super( props );

		this.state = {
			selectedService: props.post ? 'wordpress' : 'google'
		};

		this.selectPreview = this.selectPreview.bind( this );
	}

	selectPreview( selectedService ) {
		this.setState( { selectedService } );
	}

	render() {
		const { translate, hideNudge, site } = this.props;
		const { selectedService } = this.state;

		if ( hideNudge ) {
			return (
				<div className="seo-preview-pane">
					<Sidebar selectPreview={ this.selectPreview } />
					<PreviewArea { ...{ selectedService } } />
				</div>
			);
		}

		const featuresToShow = [
			FEATURE_UNLIMITED_STORAGE,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_NO_ADS,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_VIDEO_UPLOADS
		];

		// <div className="seo-preview-nudge__upgrade">
		// 	<UpgradeNudge
		// 		title={ translate( 'Advanced Search Engine Optimization' ) }
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
					<h3 className="seo-preview-nudge__message-line">{ translate( 'Supercharge your site with live chat support, unlimited access to premium themes, and Google Analytics.' ) }</h3>
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
							{ translate( 'Advanced Search Engine Optimization' ) }
						</PlanCompareCardItem>
						{
							featuresToShow.map( feature => <PlanCompareCardItem
									key={ feature }
									unavailable={ ! planHasFeature( site.plan.product_slug, feature ) }
								>
									{ getFeatureTitle( feature ) }
								</PlanCompareCardItem>
							)
						}
					</PlanCompareCard>
					<PlanCompareCard
						title={ getPlan( PLAN_BUSINESS ).getTitle() }
						line={ getPlan( PLAN_BUSINESS ).getPriceTitle() }
						buttonName={ translate( 'Upgrade' ) }
						onClick={ noop }
						currentPlan={ false }
						popularRibbon={ true } >
						<PlanCompareCardItem highlight={ true } >
							{ translate( 'Advanced Search Engine Optimization' ) }
						</PlanCompareCardItem>
						{
							featuresToShow.map( feature => <PlanCompareCardItem key={ feature }>
								{ getFeatureTitle( feature ) }
							</PlanCompareCardItem> )
						}
					</PlanCompareCard>
				</FeatureComparison>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const postId = getEditorPostId( state );
	const post = getSitePost( state, site.ID, postId );
	const isEditorShowing = 'post-editor' === getSectionName( state );

	return {
		site: {
			...site,
			name: getSeoTitle( state, 'frontPage', { site } )
		},
		post: isEditorShowing && {
			...post,
			title: getSeoTitle( state, 'posts', { site, post } )
		},
		hideNudge: site && site.plan && hasBusinessPlan( site.plan )
	};
};

export default connect( mapStateToProps, null )( localize( SeoPreviewPane ) );
