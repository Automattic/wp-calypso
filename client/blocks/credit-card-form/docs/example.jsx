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

	return (
		<CreditCardForm
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ () => Promise.reject( { message: 'This is only example' } ) }
			successCallback={ noop } />
	);
};

CreditCardFormExample.displayName = 'CreditCardForm';

export default CreditCardFormExample;
