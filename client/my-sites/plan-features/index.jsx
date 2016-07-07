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
import { isCurrentPlanPaid, isCurrentSitePlan } from 'state/sites/selectors';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanDiscountPrice } from 'state/sites/plans/selectors';
import {
	getPlanRawPrice,
	getPlan,
	getPlanSlug
} from 'state/plans/selectors';
import {
	getPlanFeaturesObject,
	isPopular,
	isMonthly
} from 'lib/plans/constants';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getPlanPath,
	canUpgradeToPlan,
	applyTestFiltersToPlansList
} from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';

class PlanFeatures extends Component {
	render() {
		if ( this.props.isPlaceholder ) {
			return <PlanFeaturesPlaceholder />;
		}

		const {
			available,
			currencyCode,
			planName,
			rawPrice,
			discountPrice,
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
					discountPrice={ discountPrice }
					billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
					onClick={ onUpgradeClick }
				/>
				<PlanFeaturesItemList>
					{
						features.map( ( feature, index ) =>
							<PlanFeaturesItem
								key={ index }
								description={ feature.getDescription ? feature.getDescription() : null }
							>
								{ feature.getTitle() }
							</PlanFeaturesItem>
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
	plan: PropTypes.string,
	isPlaceholder: PropTypes.bool,
	isInSignup: PropTypes.bool
};

PlanFeatures.defaultProps = {
	onUpgradeClick: noop,
	isInSignup: false
};

export default connect( ( state, ownProps ) => {
	const planName = ownProps.plan,
		planConstantObj = applyTestFiltersToPlansList( planName ),
		planProductId = planConstantObj.getProductId(),
		isInSignup = ownProps.isInSignup,
		selectedSiteId = isInSignup ? null : getSelectedSiteId( state ),
		planObject = getPlan( state, planProductId ),
		isPaid = isCurrentPlanPaid( state, selectedSiteId ),
		sitePlans = getPlansBySiteId( state, selectedSiteId ),
		isLoadingSitePlans = ! isInSignup && ! sitePlans.hasLoadedFromServer,
		showMonthly = ! isMonthly( ownProps.plan ),
		available = isInSignup ? true : canUpgradeToPlan( ownProps.plan );

	if ( ownProps.placeholder || ! planObject || isLoadingSitePlans ) {
		return {
			isPlaceholder: true
		};
	}

	return {
		planName,
		planConstantObj,
		available,
		current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		popular: isPopular( ownProps.plan ) && ! isPaid,
		features: getPlanFeaturesObject( planConstantObj.getFeatures() ),
		rawPrice: getPlanRawPrice( state, planProductId, showMonthly ),
		onUpgradeClick: ownProps.onUpgradeClick
			? () => {
				const planSlug = getPlanSlug( state, planProductId );

				ownProps.onUpgradeClick( getCartItemForPlan( planSlug ) );
			}
			: () => {
				if ( ! available ) {
					return;
				}

				const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
				page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( ownProps.plan ) || '' }` );
			},
		planObject: planObject,
		discountPrice: getPlanDiscountPrice( state, selectedSiteId, planName, showMonthly )
	};
} )( PlanFeatures );

