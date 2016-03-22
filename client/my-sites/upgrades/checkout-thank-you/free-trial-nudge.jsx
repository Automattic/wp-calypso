/**
 * External dependencies
 */
import { connect } from 'react-redux';
import find from 'lodash/find';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { getABTestVariation } from 'lib/abtest';
import {
	isBusiness,
	isDomainMapping,
	isDomainRegistration,
	isPremium
} from 'lib/products-values';
import paths from 'my-sites/plans/paths';
import PurchaseDetail from 'components/purchase-detail';
import {
	refreshSitePlans
} from 'state/sites/plans/actions';
import { startFreeTrial } from 'lib/upgrades/actions';
import * as upgradesNotices from 'lib/upgrades/notices';

const FreeTrialNudge = React.createClass( {
	propTypes: {
		purchases: React.PropTypes.array.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			isSubmitting: false
		};
	},

	startFreeTrial() {
		upgradesNotices.clear();

		this.setState( { isSubmitting: true } );

		startFreeTrial( this.props.selectedSite.ID, cartItems.planItem( 'value_bundle' ), ( error ) => {
			if ( error ) {
				this.setState( { isSubmitting: false } );

				upgradesNotices.displayError( error );
			} else {
				this.props.refreshSitePlans( this.props.selectedSite.ID );

				page( paths.plansDestination( this.props.selectedSite.slug, 'thank-you' ) );
			}
		} );
	},

	render() {
		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return null;
		}

		if ( ! this.props.purchases.some( isDomainMapping ) && ! this.props.purchases.some( isDomainRegistration ) ) {
			return null;
		}

		if ( ! this.props.selectedSite ) {
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
				onClick={ this.startFreeTrial }
				isSubmitting={ this.state.isSubmitting } />
		);
	}
} );

export default connect(
	undefined,
	( dispatch ) => {
		return {
			refreshSitePlans: ( siteId ) => {
				dispatch( refreshSitePlans( siteId ) );
			}
		};
	}
)( FreeTrialNudge );
