/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

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
import { PLAN_PERSONAL, getPlanObject, getPlanClass, plansList } from 'lib/plans/constants';
import analytics from 'lib/analytics';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const ExpandedUpgradeNudge = ( {
	translate,
	plan = {},
	currentPlan = {},
	planConstants = {},
	planClass,
	features,
	upgrade = () => {},
	benefits,
	title,
	subtitle,
	highlightedFeature,
	eventName = 'calypso_upgrade_nudge_impression',
	event=''
} ) => {
	//Display only if upgrade path available
	if (
		! currentPlan ||
		( planConstants.availableFor && ! planConstants.availableFor( currentPlan.productSlug ) )
	) {
		return null;
	}

	const price = formatCurrency( plan.raw_price / 12, plan.currency_code );
	const eventProperties = {
		cta_size: 'expanded',
		cta_name: event,
		cta_feature: highlightedFeature
	};

	if ( ! features ) {
		if ( planConstants.getPromotedFeatures ) {
			features = planConstants.getPromotedFeatures().filter( feature => feature !== highlightedFeature ).slice( 0, 6 );
		} else {
			features = [];
		}
	}

	return (
		<Card className="upgrade-nudge-expanded">
			<QueryPlans />
			<TrackComponentView { ...( { eventName, eventProperties } ) } />
			<div className="upgrade-nudge-expanded__business-plan-card">
				<PlanCompareCard
					title={ plan.product_name_short }
					line={ translate( '%(price)s per month, billed yearly', { args: { price } } ) }
					buttonName={ translate( 'Upgrade' ) }
					onClick={ () => {
						analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', eventProperties );
						upgrade();
					} }
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
			<div className="upgrade-nudge-expanded__description">
				<div className="upgrade-nudge-expanded__title">
					<div className="upgrade-nudge-expanded__title-plan">
						<div className={ classNames( "upgrade-nudge-expanded__title-plan-icon", planClass ) }></div>
					</div>
					<p className="upgrade-nudge-expanded__title-message">
						{ title }
					</p>
				</div>
				<p className="upgrade-nudge-expanded__subtitle">
					{ subtitle }
				</p>
				<ul className="upgrade-nudge-expanded__features">
					{ benefits.map( ( benefitTitle, index ) =>  <li key={ index } className="upgrade-nudge-expanded__feature-item">
						<Gridicon className="upgrade-nudge-expanded__feature-item-checkmark" icon="checkmark" />
						{ preventWidows( benefitTitle ) }
					</li> ) }
				</ul>
			</div>
		</Card>
	);
};

ExpandedUpgradeNudge.propTypes = {
	translate: PropTypes.func.isRequired,
	upgrade: PropTypes.func.isRequired,
	plan: PropTypes.object
};

const mapStateToProps = ( state, { plan = PLAN_PERSONAL } ) => ( {
	plan: getPlanBySlug( state, plan ),
	currentPlan: getCurrentPlan( state, getSelectedSiteId( state ) ),
	planConstants: plansList[ plan ],
	planClass: getPlanClass( plan )
} );

export default connect( mapStateToProps )( localize( ExpandedUpgradeNudge ) );
