/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryPlans from 'components/data/query-plans';
import Gridicon from 'components/gridicon';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import TrackComponentView from 'lib/analytics/track-component-view';
import formatCurrency from 'lib/format-currency';
import { preventWidows } from 'lib/formatting';
import { getFeatureTitle } from 'lib/plans';
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

const SeoSettingsNudge = ( { translate, plan = {}, upgradeToBusiness } ) => {
	const price = formatCurrency( plan.raw_price / 12, plan.currency_code );

	return (
		<Card className="settings-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_settings_upgrade_nudge_impression" />
			<div className="settings-upgrade-nudge__business-plan-card">
				<PlanCompareCard
					title={ plan.product_name_short }
					line={ translate( '%(price)s per month, billed yearly', { args: { price } } ) }
					buttonName={ translate( 'Upgrade' ) }
					onClick={ upgradeToBusiness }
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
			</div>
			<div className="settings-upgrade-nudge__description">
				<div className="settings-upgrade-nudge__title">
					<div className="settings-upgrade-nudge__title-plan">
						<div className="settings-upgrade-nudge__title-plan-icon"></div>
					</div>
					<p className="settings-upgrade-nudge__title-message">
						{ translate( 'Upgrade to a Business Plan and Enable Advanced SEO' ) }
					</p>
				</div>
				<p className="settings-upgrade-nudge__subtitle">
					{ translate( 'By upgrading to a Business Plan you\'ll enable advanced SEO features on your site.' ) }
				</p>
				<ul className="settings-upgrade-nudge__features">
					<li className="settings-upgrade-nudge__feature-item">
						<Gridicon className="settings-upgrade-nudge__feature-item-checkmark" icon="checkmark" />
						{ preventWidows( translate( 'Preview your site\'s posts and pages as they will appear when shared on Facebook, Twitter and the WordPress.com Reader.' ) ) }
					</li>
					<li className="settings-upgrade-nudge__feature-item">
						<Gridicon className="settings-upgrade-nudge__feature-item-checkmark" icon="checkmark" />
						{ preventWidows( translate( 'Allow you to control how page titles will appear on Google search results, or when shared on social networks.' ) ) }
					</li>
					<li className="settings-upgrade-nudge__feature-item">
						<Gridicon className="settings-upgrade-nudge__feature-item-checkmark" icon="checkmark" />
						{ preventWidows( translate( 'Modify front page meta data in order to customize how your site appears to search engines.' ) ) }
					</li>
				</ul>
			</div>
		</Card>
	);
};

SeoSettingsNudge.propTypes = {
	translate: PropTypes.func.isRequired,
	upgradeToBusiness: PropTypes.func.isRequired,
	plan: PropTypes.object
};

const mapStateToProps = state => ( {
	plan: getPlanBySlug( state, PLAN_BUSINESS )
} );

export default connect( mapStateToProps )( localize( SeoSettingsNudge ) );
