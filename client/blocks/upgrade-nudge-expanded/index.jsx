/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { bindActionCreators } from 'redux';
import Gridicon from 'components/gridicon';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card, ProductIcon } from '@automattic/components';
import QueryPlans from 'components/data/query-plans';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import TrackComponentView from 'lib/analytics/track-component-view';
import { preventWidows } from 'lib/formatting';
import { getPlan } from 'lib/plans';
import { getFeatureTitle } from 'lib/plans/features-list';
import { getPlanBySlug } from 'state/plans/selectors';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { getSitePlan, getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class UpgradeNudgeExpanded extends Component {
	constructor( props ) {
		super( props );
		this.upgrade = this.upgrade.bind( this );
		this.eventProperties = {
			cta_size: 'expanded',
			cta_name: props.event,
			cta_feature: props.highlightedFeature,
		};
	}

	upgrade() {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', this.eventProperties );
		if ( this.props.upgrade ) {
			this.props.upgrade();
		} else if ( this.props.planConstants.getPathSlug && this.props.siteSlug ) {
			page( `/checkout/${ this.props.siteSlug }/${ this.props.planConstants.getPathSlug() }` );
		}
	}

	render() {
		if ( ! this.props.currentPlan && ! this.props.forceDisplay ) {
			return null;
		}

		const price = formatCurrency( this.props.plan.raw_price / 12, this.props.plan.currency_code );
		const features = this.props.planConstants
			.getPlanCompareFeatures()
			.filter( ( feature ) => feature !== this.props.highlightedFeature )
			.slice( 0, 6 );

		return (
			<Card className="upgrade-nudge-expanded">
				<QueryPlans />
				<TrackComponentView
					eventName={ this.props.eventName }
					eventProperties={ this.eventProperties }
				/>
				<div className="upgrade-nudge-expanded__plan-card">
					<PlanCompareCard
						title={ this.props.plan.product_name_short }
						line={ this.props.translate( '%(price)s per month, billed yearly', {
							args: { price },
						} ) }
						buttonName={ this.props.translate( 'Upgrade' ) }
						onClick={ this.upgrade }
						currentPlan={ false }
						popularRibbon={ true }
					>
						{ this.props.highlightedFeature && (
							<PlanCompareCardItem highlight={ true }>
								{ getFeatureTitle( this.props.highlightedFeature ) }
							</PlanCompareCardItem>
						) }
						{ features.map( ( feature ) => (
							<PlanCompareCardItem key={ feature }>
								{ getFeatureTitle( feature ) }
							</PlanCompareCardItem>
						) ) }
					</PlanCompareCard>
				</div>
				<div className="upgrade-nudge-expanded__description">
					{ this.props.title && (
						<div className="upgrade-nudge-expanded__title">
							<div className="upgrade-nudge-expanded__title-plan">
								{ this.props.plan.product_slug && (
									<ProductIcon
										slug={ this.props.plan.product_slug }
										className="upgrade-nudge-expanded__title-plan-icon"
									/>
								) }
							</div>
							<p className="upgrade-nudge-expanded__title-message">{ this.props.title }</p>
						</div>
					) }
					{ this.props.subtitle && (
						<p className="upgrade-nudge-expanded__subtitle">{ this.props.subtitle }</p>
					) }
					{ this.props.benefits && (
						<ul className="upgrade-nudge-expanded__features">
							{ this.props.benefits.map( ( benefitTitle, index ) => (
								<li key={ index } className="upgrade-nudge-expanded__feature-item">
									<Gridicon
										className="upgrade-nudge-expanded__feature-item-checkmark"
										icon="checkmark"
									/>
									{ preventWidows( benefitTitle ) }
								</li>
							) ) }
						</ul>
					) }
					{ this.props.children }
				</div>
			</Card>
		);
	}
}

UpgradeNudgeExpanded.defaultProps = {
	plan: {},
	currentPlan: {},
	planConstants: {},
	eventName: 'calypso_upgrade_nudge_impression',
};

UpgradeNudgeExpanded.propTypes = {
	translate: PropTypes.func.isRequired,
	plan: PropTypes.object.isRequired,
	currentPlan: PropTypes.object,
	planConstants: PropTypes.object,
	upgrade: PropTypes.func,
	benefits: PropTypes.array,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	highlightedFeature: PropTypes.string,
	eventName: PropTypes.string,
	event: PropTypes.string,
	siteSlug: PropTypes.string,
	forceDisplay: PropTypes.bool,
	recordTracksEvent: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { plan = PLAN_PERSONAL } ) => ( {
	plan: getPlanBySlug( state, plan ),
	currentPlan: getSitePlan( state, getSelectedSiteId( state ) ),
	planConstants: getPlan( plan ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

const mapDispatchToProps = ( dispatch ) => bindActionCreators( { recordTracksEvent }, dispatch );

export default connect( mapStateToProps, mapDispatchToProps )( localize( UpgradeNudgeExpanded ) );
