/**
 * External dependencies
 */

import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardForm from 'calypso/blocks/credit-card-form';

const saveStoredCard = () => Promise.reject( { message: 'This is an example error.' } );

const CreditCardFormExample = () => {
	const initialValues = {
		name: 'John Doe',
	};

	return (
		<CreditCardForm
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ saveStoredCard }
			successCallback={ noop }
		/>
	);
};

CreditCardFormExample.displayName = 'CreditCardForm';

export default CreditCardFormExample;
