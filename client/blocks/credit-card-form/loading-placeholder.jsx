/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import { Card, CompactCard } from '@automattic/components';
import CreditCardFormFieldsLoadingPlaceholder from 'components/credit-card-form-fields/loading-placeholder';
import FormButton from 'components/forms/form-button';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';

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
