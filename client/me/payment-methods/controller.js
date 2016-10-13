/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AddCreditCard from 'me/payment-methods/add-credit-card';
import paths from 'me/purchases/paths';
import { recordPageView, renderPage } from 'lib/react-helpers';

export function addCreditCard( context ) {
	recordPageView(
		paths.addCreditCard(),
		'Payment Methods',
		'Add Credit Card'
	);

	renderPage(
		context,
		<AddCreditCard />
	);
}
