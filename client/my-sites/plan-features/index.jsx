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
import { isCurrentSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanRawPrice, getPlan } from 'state/plans/selectors';
import { plansList, getPlanFeaturesObject, PLAN_PREMIUM } from 'lib/plans/constants';

class PlanFeatures extends Component {
	render() {
		const {
			planName,
			rawPrice,
			popular,
			current,
			planConstantObj,
			features,
			billingTimeFrame
		} = this.props;

		const classes = classNames( 'plan-features', {
			'is-popular': popular
		} );

		return (
			<div className={ classes } >
				<PlanFeaturesHeader
					current={ current }
					popular={ popular }
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
				<PlanFeaturesFooter current={ current } description={ planConstantObj.getDescription() } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const planProductId = plansList[ ownProps.plan ].getProductId();
	const selectedSiteId = getSelectedSiteId( state );

	return {
		planName: ownProps.plan,
		current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
		popular: ownProps.plan === PLAN_PREMIUM,
		features: getPlanFeaturesObject( ownProps.plan ),
		rawPrice: getPlanRawPrice( state, planProductId /**, get from abtest **/ ),
		planConstantObj: plansList[ ownProps.plan ],
		billingTimeFrame: getPlan( state, planProductId ).bill_period_label
	};
} )( PlanFeatures );

