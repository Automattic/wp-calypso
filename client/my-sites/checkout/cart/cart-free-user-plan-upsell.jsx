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
import { getSelectedSite } from 'state/ui/selectors';
import { siteHasPaidPlan } from 'signup/steps/site-picker/site-picker-submit';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { PLAN_UPSELL_FOR_FREE_USERS } from 'state/current-user/constants';
import { hasPlan } from 'lib/cart-values/cart-items';

class CartFreeUserPlanUpsell extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		showPlanUpsell: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { cart, selectedSite, showPlanUpsell } = this.props;

		if (
			! showPlanUpsell ||
			! selectedSite ||
			siteHasPaidPlan( selectedSite ) ||
			hasPlan( cart )
		) {
			return null;
		}

		return (
			<div>
				<span>TODO!</span>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );

	return {
		selectedSite,
		showPlanUpsell: getCurrentUser( state )
			? currentUserHasFlag( state, PLAN_UPSELL_FOR_FREE_USERS )
			: false,
	};
};

export default connect( mapStateToProps )( localize( CartFreeUserPlanUpsell ) );
