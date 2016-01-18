/**
 * External dependencies
 */
import React from 'react';
import Dispatcher from 'dispatcher';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import { cartItems } from 'lib/cart-values';
import TransactionStepsMixin from 'my-sites/upgrades/checkout/transaction-steps-mixin';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import { clearSitePlans } from 'state/sites/plans/actions';

const StartTrial = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	handleSubmit: function( event ) {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Free Trial Form' );

		// invalidate `sitePlans` (/sites/:site/plans)
		this.props.clearSitePlans();

		// Refresh all sites (/sites) to have an updated `site.plan` value.
		Dispatcher.handleViewAction( {
			type: 'FETCH_SITES'
		} );

		// `submitTransaction` comes from the `TransactionStepsMixin`
		this.submitTransaction( event );
	},

	isLoading: function() {
		return ! cartItems.hasFreeTrial( this.props.cart );
	},

	render: function() {
		if ( this.isLoading() ) {
			return (
				<FreeTrialConfirmationBox.Placeholder />
			);
		}

		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				selected={ true }
				onSubmit={ this.handleSubmit }
				transactionStep={ this.props.transaction.step } />
		);
	}
} );

export default connect(
	undefined,
	function mapDispatchToProps( dispatch, ownProps ) {
		return {
			clearSitePlans() {
				dispatch( clearSitePlans( ownProps.site.ID ) );
			}
		};
	}
)( StartTrial );
