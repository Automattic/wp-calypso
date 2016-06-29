/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import page from 'page';

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
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanRawPrice, getPlan } from 'state/plans/selectors';
import {
	plansList,
	getPlanFeaturesObject,
	isPopular,
	isMonthly
} from 'lib/plans/constants';
import { getSiteSlug } from 'state/sites/selectors';
import { getPlanPath, canUpgradeToPlan } from 'lib/plans';

class PlanFeatures extends Component {
	render() {
		if ( ! this.props.planObject || this.props.isPlaceholder ) {
			return <PlanFeaturesPlaceholder />;
		}

		const {
			available,
			currencyCode,
			planName,
			rawPrice,
			popular,
			current,
			planConstantObj,
			features,
			onUpgradeClick
		} = this.props;

		const classes = classNames( 'plan-features', {
			'is-popular': popular
		} );

		return (
			<div className={ classes } >
				<PlanFeaturesHeader
					current={ current }
					currencyCode={ currencyCode }
					popular={ popular }
					title={ planConstantObj.getTitle() }
					planType={ planName }
					rawPrice={ rawPrice }
					billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
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
					available = { available }
					description={ planConstantObj.getDescription() }
					onUpgradeClick={ onUpgradeClick }
				/>
			</div>
		);
	}
}

PlanFeatures.propTypes = {
	available: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plan prop or isPlaceholder prop
	plan: React.PropTypes.string,
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
		currencyCode: getCurrentUserCurrencyCode( state ),
		popular: isPopular( ownProps.plan ),
		features: getPlanFeaturesObject( ownProps.plan ),
		rawPrice: getPlanRawPrice( state, planProductId, ! isMonthly( ownProps.plan ) ),
		planConstantObj: plansList[ ownProps.plan ],
		available : canUpgradeToPlan( ownProps.plan ),
		onUpgradeClick: () => {
			const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
			page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( ownProps.plan ) || '' }` );
		},
		planObject: planObject
	};
} )( PlanFeatures );

