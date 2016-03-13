/**
 * External dependencies
 */
import { connect } from 'react-redux';
import find from 'lodash/find';
import React from 'react';

/**
 * Internal dependencies
 */
import { getABTestVariation } from 'lib/abtest';
import { getPlansBySite } from 'state/sites/plans/selectors';
import {
	isBusiness,
	isDomainMapping,
	isDomainRegistration,
	isPremium
} from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';

const FreeTrialNudge = React.createClass( {
	propTypes: {
		purchases: React.PropTypes.array.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	render() {
		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return null;
		}

		if ( ! this.props.purchases.some( isDomainMapping ) && ! this.props.purchases.some( isDomainRegistration ) ) {
			return null;
		}

		if ( isBusiness( this.props.selectedSite.plan ) || isPremium( this.props.selectedSite.plan ) ) {
			return null;
		}

		if ( ! this.props.sitePlans.hasLoadedFromServer ) {
			return null;
		}

		const premiumPlan = find( this.props.sitePlans.data, isPremium );

		if ( ! premiumPlan.canStartTrial ) {
			return null;
		}

		return (
			<PurchaseDetail
				icon="clipboard"
				title={ this.translate( 'Try WordPress.com Premium free for 14 days' ) }
				description={ this.translate( 'Go beyond basic with a supercharged WordPress.com website. The same easy-to-use platform, now with more features and more customization.' ) }
				buttonText={ this.translate( 'Try Premium for Free' ) }
				href={ '#' } />
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			sitePlans: getPlansBySite( state, props.selectedSite )
		};
	}
)( FreeTrialNudge );
