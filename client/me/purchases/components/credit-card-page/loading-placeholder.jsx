/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import CreditCardFormLoadingPlaceholder from 'components/upgrades/credit-card-form/loading-placeholder';
import FormButton from 'components/forms/form-button';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';

const CreditCardPageLoadingPlaceholder = ( { title } ) => {
	return (
		<LoadingPlaceholder title={ title }>
			<Card className="credit-card-page__content">
				<CreditCardFormLoadingPlaceholder />
			</Card>

			<CompactCard className="credit-card-page__footer">
				<FormButton isPrimary={ false } />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

export default CreditCardPageLoadingPlaceholder;
