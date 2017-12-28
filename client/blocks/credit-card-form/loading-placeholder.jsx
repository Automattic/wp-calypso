/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'client/components/card';
import CompactCard from 'client/components/card/compact';
import CreditCardFormFieldsLoadingPlaceholder from 'client/components/credit-card-form-fields/loading-placeholder';
import FormButton from 'client/components/forms/form-button';
import LoadingPlaceholder from 'client/me/purchases/components/loading-placeholder';

const CreditCardFormLoadingPlaceholder = ( { title } ) => {
	return (
		<LoadingPlaceholder title={ title }>
			<Card className="credit-card-form__content">
				<CreditCardFormFieldsLoadingPlaceholder />
			</Card>

			<CompactCard className="credit-card-form__footer">
				<FormButton isPrimary={ false } />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

export default CreditCardFormLoadingPlaceholder;
