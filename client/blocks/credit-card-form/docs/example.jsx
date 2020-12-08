/**
 * External dependencies
 */

import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardForm from 'calypso/blocks/credit-card-form';

const createCardToken = ( cardDetails, callback ) => callback( null, 'token' );
const saveStoredCard = () => Promise.reject( { message: 'This is an example error.' } );

const CreditCardFormExample = () => {
	const initialValues = {
		name: 'John Doe',
	};

	return (
		<CreditCardForm
			createCardToken={ createCardToken }
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ saveStoredCard }
			successCallback={ noop }
			autoFocus={ false }
		/>
	);
};

CreditCardFormExample.displayName = 'CreditCardForm';

export default CreditCardFormExample;
