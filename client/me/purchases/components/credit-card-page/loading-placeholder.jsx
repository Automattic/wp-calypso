/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import CreditCardFormFieldsLoadingPlaceholder from 'components/credit-card-form-fields/loading-placeholder';
import FormButton from 'components/forms/form-button';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';

const CreditCardPageLoadingPlaceholder = ( { title } ) => {
	return (
		<LoadingPlaceholder title={ title }>
			<Card className="credit-card-page__content">
				<CreditCardFormFieldsLoadingPlaceholder />
			</Card>

			<CompactCard className="credit-card-page__footer">
				<FormButton isPrimary={ false } />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

export default CreditCardPageLoadingPlaceholder;
