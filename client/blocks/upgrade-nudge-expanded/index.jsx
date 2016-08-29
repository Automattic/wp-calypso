/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import page from 'page';


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
import { PLAN_PERSONAL, getPlanClass, plansList } from 'lib/plans/constants';
import analytics from 'lib/analytics';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class ExpandedUpgradeNudge extends Component {
	constructor( props ) {
		super( props );
		this.upgrade = this.upgrade.bind( this );
		this.eventProperties = {
			cta_size: 'expanded',
			cta_name: props.event,
			cta_feature: props.highlightedFeature
		};
	}

	upgrade() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', this.eventProperties );
		if ( this.props.upgrade ) {
			this.props.upgrade();
		} else if ( this.props.planConstants.getPathSlug && this.props.siteSlug ) {
			page( `/checkout/${ this.props.siteSlug }/${ this.props.planConstants.getPathSlug() }` );
		}
	}

	render() {
		//Display only if upgrade path available
		if (
			! this.props.currentPlan ||
			( this.props.planConstants.availableFor && ! this.props.planConstants.availableFor( this.props.currentPlan.productSlug ) )
		) {
			return null;
		}

		const price = formatCurrency( this.props.plan.raw_price / 12, this.props.plan.currency_code );
		let features = this.props.features;
		if ( ! features ) {
			if ( this.props.planConstants.getPromotedFeatures ) {
				features = this.props.planConstants.getPromotedFeatures().filter(
					feature => feature !== this.props.highlightedFeature
				).slice( 0, 6 );
			} else {
				features = [];
			}
		}

		return (
			<Card className="upgrade-nudge-expanded">
				<QueryPlans />
				<TrackComponentView { ...( { eventName: this.props.eventName, eventProperties: this.eventProperties } ) } />
				<div className="upgrade-nudge-expanded__business-plan-card">
					<PlanCompareCard
						title={ this.props.plan.product_name_short }
						line={ this.props.translate( '%(price)s per month, billed yearly', { args: { price } } ) }
						buttonName={ this.props.translate( 'Upgrade' ) }
						onClick={ this.upgrade }
						currentPlan={ false }
						popularRibbon={ true } >
						{ this.props.highlightedFeature && <PlanCompareCardItem highlight={ true } >
							{ getFeatureTitle( this.props.highlightedFeature ) }
						</PlanCompareCardItem> }
						{ features.map( feature => (
							<PlanCompareCardItem key={ feature }>
								{ getFeatureTitle( feature ) }
							</PlanCompareCardItem>
						) ) }
					</PlanCompareCard>
				</div>
				<div className="upgrade-nudge-expanded__description">
					{ this.props.title && <div className="upgrade-nudge-expanded__title">
						<div className="upgrade-nudge-expanded__title-plan">
							<div className={ classNames( "upgrade-nudge-expanded__title-plan-icon", this.props.planClass ) }></div>
						</div>
						<p className="upgrade-nudge-expanded__title-message">
							{ this.props.title }
						</p>
					</div> }
					{ this.props.subtitle && <p className="upgrade-nudge-expanded__subtitle">
						{ this.props.subtitle }
					</p> }
					{ this.props.benefits && <ul className="upgrade-nudge-expanded__features">
						{ this.props.benefits.map( ( benefitTitle, index ) => <li key={ index } className="upgrade-nudge-expanded__feature-item">
							<Gridicon className="upgrade-nudge-expanded__feature-item-checkmark" icon="checkmark" />
							{ preventWidows( benefitTitle ) }
						</li> ) }
					</ul> }
					{ this.props.children }
				</div>
			</Card>
		);
	}
}

ExpandedUpgradeNudge.defaultProps = {
	plan: {},
	currentPlan: {},
	planConstants: {},
	eventName: 'calypso_upgrade_nudge_impression'
};

ExpandedUpgradeNudge.propTypes = {
	translate: PropTypes.func.isRequired,
	plan: PropTypes.object,
	currentPlan: PropTypes.object,
	planConstants: PropTypes.object,
	planClass: PropTypes.string,
	features: PropTypes.array,
	upgrade: PropTypes.func,
	benefits: PropTypes.array,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	highlightedFeature: PropTypes.string,
	eventName: PropTypes.string,
	event: PropTypes.string,
	siteSlug: PropTypes.string
};

const mapStateToProps = ( state, { plan = PLAN_PERSONAL } ) => ( {
	plan: getPlanBySlug( state, plan ),
	currentPlan: getCurrentPlan( state, getSelectedSiteId( state ) ),
	planConstants: plansList[ plan ],
	planClass: getPlanClass( plan ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( ExpandedUpgradeNudge ) );
