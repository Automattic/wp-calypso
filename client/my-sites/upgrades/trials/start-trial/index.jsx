/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import { cartItems } from 'lib/cart-values';
import TransactionStepsMixin from 'my-sites/upgrades/checkout/transaction-steps-mixin';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';

const StartTrial = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	handleSubmit: function( event ) {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Free Trial Form' );

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

export default StartTrial;
