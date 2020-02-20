/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSite } from 'state/ui/selectors';
import { siteHasPaidPlan } from 'signup/steps/site-picker/site-picker-submit';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { PLAN_UPSELL_FOR_FREE_USERS } from 'state/current-user/constants';
import { hasPlan } from 'lib/cart-values/cart-items';
import SectionHeader from 'components/section-header';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getPlan as getPlanById, isRequestingPlans } from 'state/plans/selectors';
import { getPlan } from 'lib/plans';
import { getPlanPrice } from 'state/products-list/selectors';

class CartFreeUserPlanUpsell extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		hasPaidPlan: PropTypes.bool,
		hasPlanInCart: PropTypes.bool,
		isPlansListFetching: PropTypes.bool,
		isSitePlansListFetching: PropTypes.bool,
		personalPlan: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		planPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
		showPlanUpsell: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	isLoading() {
		const isLoadingCart = ! this.props.cart.hasLoadedFromServer;
		const isLoadingPlans = this.props.isPlansListFetching;
		const isLoadingSitePlans = this.props.isSitePlansListFetching;
		return isLoadingCart || isLoadingPlans || isLoadingSitePlans;
	}

	getUpgradeText() {
		return 'TODO!';
	}

	render() {
		if ( this.isLoading() ) {
			return null;
		}

		const { hasPaidPlan, hasPlanInCart, selectedSite, showPlanUpsell, translate } = this.props;

		if ( ! showPlanUpsell || ! selectedSite || hasPaidPlan || hasPlanInCart ) {
			return null;
		}

		const header = translate( 'Upgrade and save' );

		return (
			<div>
				<SectionHeader className="cart__header" label={ header } />
				<div style={ { padding: '16px' } }>
					<p>{ this.getUpgradeText() }</p>
					<Button>{ 'Add to cart' }</Button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { cart } ) => {
	const selectedSite = getSelectedSite( state );
	const isPlansListFetching = isRequestingPlans( state );
	const personalPlanId = getPlan( PLAN_PERSONAL ).getProductId();
	const personalPlan = ! isPlansListFetching && getPlanById( state, personalPlanId );

	return {
		hasPaidPlan: siteHasPaidPlan( selectedSite ),
		hasPlanInCart: hasPlan( cart ),
		isPlansListFetching: isPlansListFetching,
		isSitePlansListFetching: isRequestingSitePlans( state ),
		personalPlan: personalPlan,
		planPrice: personalPlan && getPlanPrice( state, selectedSite.ID, personalPlan, false ),
		selectedSite: selectedSite,
		showPlanUpsell: getCurrentUser( state )
			? currentUserHasFlag( state, PLAN_UPSELL_FOR_FREE_USERS )
			: false,
	};
};

export default connect( mapStateToProps )( localize( CartFreeUserPlanUpsell ) );
