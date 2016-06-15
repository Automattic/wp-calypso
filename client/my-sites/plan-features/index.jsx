/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItemList from './list';
import PlanFeaturesItem from './item';
import PlanFeaturesFooter from './footer';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanRawPrice , getPlan } from 'state/plans/selectors';
import sitesFactory from 'lib/sites-list';
import { plansList, getPlanFeaturesObject, PLAN_PREMIUM } from 'lib/plans/constants';

class PlanFeatures extends Component {
	render() {
		const {
			planName,
			rawPrice,
			popular,
			current,
			features,
			description,
			billingTimeFrame
		} = this.props;

		const classes = classNames( 'plan-features', {
			'is-popular': popular
		} );

		return (
			<div className={ classes } >
				<PlanFeaturesHeader
					current={ current }
					title={ plansList[ planName ].getTitle() }
					planType={ planName }
					rawPrice={ rawPrice }
					billingTimeFrame={ billingTimeFrame }
				/>
				<PlanFeaturesItemList>
					{
						features.map( ( feature, index ) =>
							<PlanFeaturesItem key={ index }>{ feature.getTitle() }</PlanFeaturesItem>
						)
					}
				</PlanFeaturesItemList>
				<PlanFeaturesFooter current={ current } description={ description } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const planProductId = plansList[ ownProps.plan ].getProductId();
	let sitePlanObj = getCurrentPlan( state, sitesFactory().getSelectedSite() );

	if ( sitePlanObj === null ) {
		sitePlanObj = {
			currentPlan: false
		};
	}

	return {
		planName: ownProps.plan,
		current: sitePlanObj.currentPlan,
		popular: ownProps.plan === PLAN_PREMIUM,
		features: getPlanFeaturesObject( ownProps.plan ),
		description: plansList[ ownProps.plan ].getDescription(),
		rawPrice: getPlanRawPrice( state, planProductId ),
		billingTimeFrame: getPlan( state, planProductId ).bill_period_label
	};
} )( PlanFeatures );

