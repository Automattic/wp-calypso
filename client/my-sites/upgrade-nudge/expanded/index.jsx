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
import { PLAN_PERSONAL, getPlanObject } from 'lib/plans/constants';

const SeoSettingsNudge = ( { translate, plan = {}, planConstants = {}, features, upgrade = () => {}, benefits, title, subtitle, highlightedFeature } ) => {
	const price = formatCurrency( plan.raw_price / 12, plan.currency_code );
	if ( ! features ) {
		if ( planConstants.promotedFeatures ) {
			features = planConstants.promotedFeatures.filter( feature => feature !== highlightedFeature ).slice( 0, 6 );
		} else {
			features = [];
		}
	}

	return (
		<Card className="settings-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_settings_upgrade_nudge_impression" />
			<div className="settings-upgrade-nudge__business-plan-card">
				<PlanCompareCard
					title={ plan.product_name_short }
					line={ translate( '%(price)s per month, billed yearly', { args: { price } } ) }
					buttonName={ translate( 'Upgrade' ) }
					onClick={ upgrade }
					currentPlan={ false }
					popularRibbon={ true } >
					<PlanCompareCardItem highlight={ true } >
						{ getFeatureTitle( highlightedFeature ) }
					</PlanCompareCardItem>
					{ features.map( feature => (
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
						{ title }
					</p>
				</div>
				<p className="settings-upgrade-nudge__subtitle">
					{ subtitle }
				</p>
				<ul className="settings-upgrade-nudge__features">
					{ benefits.map( ( benefitTitle, index ) =>  <li key={ index } className="settings-upgrade-nudge__feature-item">
						<Gridicon className="settings-upgrade-nudge__feature-item-checkmark" icon="checkmark" />
						{ preventWidows( benefitTitle ) }
					</li> ) }
				</ul>
			</div>
		</Card>
	);
};

SeoSettingsNudge.propTypes = {
	translate: PropTypes.func.isRequired,
	upgrade: PropTypes.func.isRequired,
	plan: PropTypes.object
};

const mapStateToProps = ( state, { plan = PLAN_PERSONAL } ) => ( {
	plan: getPlanBySlug( state, plan ),
	planConstants: getPlanObject( plan )
} );

export default connect( mapStateToProps )( localize( SeoSettingsNudge ) );
