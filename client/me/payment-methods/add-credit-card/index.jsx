/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { concatTitle } from 'lib/react-helpers';
import DocumentHead from 'components/data/document-head';
import * as titles from 'me/payment-methods/titles';

const AddCreditCard = () => (
	<div>
		<DocumentHead title={ concatTitle( titles.paymentMethods, titles.addCreditCard, ) } />
		<h1>Add Credit Card</h1>
	</div>
);

export default AddCreditCard;
