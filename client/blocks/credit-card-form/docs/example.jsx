/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardForm from 'blocks/credit-card-form';

const CreditCardFormExample = () => {
	const initialValues = {
		name: 'John Doe'
	};

	const createPaygateToken = ( cardDetails, callback ) => callback( null, 'token' );

	return (
		<CreditCardForm
			createPaygateToken={ createPaygateToken }
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ () => Promise.reject( { message: 'This is an example error.' } ) }
			successCallback={ noop } />
	);
};

CreditCardFormExample.displayName = 'CreditCardForm';

export default CreditCardFormExample;
