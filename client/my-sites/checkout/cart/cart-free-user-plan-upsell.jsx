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
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { siteHasPaidPlan } from 'signup/steps/site-picker/site-picker-submit';

class CartFreeUserPlanUpsell extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		translate: PropTypes.func.isRequired,
		sitePlans: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	render() {
		const { selectedSite } = this.props;
		if ( ! this.props.selectedSite || siteHasPaidPlan( selectedSite ) ) {
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
		sitePlans: getPlansBySite( state, selectedSite ),
	};
};

export default connect( mapStateToProps )( localize( CartFreeUserPlanUpsell ) );
