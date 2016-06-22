/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItemList from './list';
import PlanFeaturesItem from './item';
import PlanFeaturesFooter from './footer';
import PlanFeaturesPlaceholder from './placeholder';
import { isCurrentSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanRawPrice, getPlan } from 'state/plans/selectors';
import { plansList, getPlanFeaturesObject, PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';

class PlanFeatures extends Component {
	render() {
		if ( ! this.props.planObject || this.props.isPlaceholder ) {
			return <PlanFeaturesPlaceholder />;
		}

		const {
			planName,
			rawPrice,
			popular,
			current,
			planConstantObj,
			features,
			billingTimeFrame,
			onUpgradeClick
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
					onClick={ onUpgradeClick }
				/>
				<PlanFeaturesItemList>
					{
						features.map( ( feature, index ) =>
							<PlanFeaturesItem key={ index }>{ feature.getTitle() }</PlanFeaturesItem>
						)
					}
				</PlanFeaturesItemList>
				<PlanFeaturesFooter
					current={ current }
					description={ planConstantObj.getDescription() }
					onUpgradeClick={ onUpgradeClick }
				/>
			</div>
		);
	}
}

PlanFeatures.propTypes = {
	onUgradeClick: PropTypes.func,
	// either you specify the plan prop or isPlaceholder prop
	plan: React.PropTypes.oneOf( [ PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS ] ),
	isPlaceholder: PropTypes.bool
};

PlanFeatures.defaultProps = {
	onUpgradeClick: noop
};

export default connect( ( state, ownProps ) => {
	if ( ownProps.placeholder ) {
		return {
			isPlaceholder: true
		};
	}

	const planProductId = plansList[ ownProps.plan ].getProductId();
	const selectedSiteId = getSelectedSiteId( state );
	const planObject = getPlan( state, planProductId );

	return {
		planName: ownProps.plan,
		current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
		popular: ownProps.plan === PLAN_PREMIUM,
		features: getPlanFeaturesObject( ownProps.plan ),
		rawPrice: getPlanRawPrice( state, planProductId /**, get from abtest **/ ),
		planConstantObj: plansList[ ownProps.plan ],
		billingTimeFrame: get( planObject, 'bill_period_label', '' ),
		planObject: planObject
	};
} )( PlanFeatures );

