/**
 * External dependencies
 */
var isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented(),
	TransactionFlow = require( './transaction-flow' ),
	freeTransactions = require( './free-transactions'),
	cartLib = require( 'lib/cart' ),
	paygate = require( './paygate' );

/**
 * Make a purchase on WordPress.com.
 *
 * @returns {Readable} A stream of transaction flow steps.
 *
 * @param {CartValue} cart - The current state of the user's shopping cart.
 * @param {object} cardDetails - The credit card being used for this
 * @param {object} domainDetails - Optional domain registration details if the shopping cart contains a domain registration product
 *   transaction.
 */
function submit( params ) {
	return new TransactionFlow( params );
}

function hasDomainDetails( transaction ) {
	return ! isEmpty( transaction.domainDetails );
}

function newCardPayment( newCardDetails ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Paygate',
		newCardDetails: newCardDetails || {}
	};
}

function storedCardPayment( storedCard ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
		storedCard: storedCard,
	};
}

function fullCreditsPayment() {
	return { paymentMethod: 'WPCOM_Billing_WPCOM' };
}

module.exports = {
	hasDomainDetails: hasDomainDetails,
	submit: submit,
	newCardPayment: newCardPayment,
	storedCardPayment: storedCardPayment,
	fullCreditsPayment: fullCreditsPayment,
	createPaygateToken: paygate.createToken,
	free: freeTransactions
};
