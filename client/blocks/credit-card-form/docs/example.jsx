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
		<div className="design-assets__group">
			<h2>
				<a href="/devdocs/blocks/credit-card-form">Credit Card Form</a>
			</h2>
			<CreditCardForm
				initialValues={ initialValues }
				recordFormSubmitEvent={ noop }
				saveStoredCard={ () => Promise.reject( { message: 'This is only example' } ) }
				successCallback={ noop } />
		</div>
	);
};

CreditCardFormExample.displayName = 'CreditCardForm';

export default CreditCardFormExample;
