/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS
} from 'lib/plans/constants';
import {
	FindNewThemeFeature
} from './features-list';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';

class PlanPurchaseFeatures extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired
	};

	getBusinessFeatures() {
		const { selectedSite } = this.props;

		return [
			<FindNewThemeFeature selectedSite={ selectedSite } key="findNewThemeFeature" />
		];
	}

	getPlanPurchaseFeatures() {
		const { plan } = this.props;

		switch ( plan ) {
			case PLAN_BUSINESS:
				return this.getBusinessFeatures();
			default:
				return null;
		}
	}

	render() {
		return (
			<div className="plan-purchase-features">
				{ this.getPlanPurchaseFeatures() }
			</div>
		);
	}
}

export default connect( ( state ) => {
	return {
		selectedSite: getSelectedSite( state ),
		sitePlans: getPlansBySite( state, getSelectedSite( state ) )
	};
} )( localize( PlanPurchaseFeatures ) );
