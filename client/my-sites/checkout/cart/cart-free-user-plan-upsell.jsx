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

class CartFreeUserPlanUpsell extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		hasPaidPlan: PropTypes.bool,
		hasPlanInCart: PropTypes.bool,
		showPlanUpsell: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { hasPaidPlan, hasPlanInCart, selectedSite, showPlanUpsell, translate } = this.props;

		if ( ! showPlanUpsell || ! selectedSite || hasPaidPlan || hasPlanInCart ) {
			return null;
		}

		const header = translate( 'Upgrade and save' );

		return (
			<div>
				<SectionHeader className="cart__header" label={ header } />
				<div style={ { padding: '16px' } }>
					<p>TODO!</p>
					<Button>{ 'Add to cart' }</Button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { cart } ) => {
	const selectedSite = getSelectedSite( state );

	return {
		hasPaidPlan: siteHasPaidPlan( selectedSite ),
		hasPlanInCart: hasPlan( cart ),
		selectedSite: selectedSite,
		showPlanUpsell: getCurrentUser( state )
			? currentUserHasFlag( state, PLAN_UPSELL_FOR_FREE_USERS )
			: false,
	};
};

export default connect( mapStateToProps )( localize( CartFreeUserPlanUpsell ) );
