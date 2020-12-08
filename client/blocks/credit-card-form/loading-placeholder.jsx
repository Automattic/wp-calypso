/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import { Card, CompactCard } from '@automattic/components';
import CreditCardFormFieldsLoadingPlaceholder from 'calypso/components/credit-card-form-fields/loading-placeholder';
import FormButton from 'calypso/components/forms/form-button';
import LoadingPlaceholder from 'calypso/me/purchases/components/loading-placeholder';

const CreditCardFormLoadingPlaceholder = ( { title, isFullWidth } ) => {
	return (
		<LoadingPlaceholder title={ title } isFullWidth={ isFullWidth }>
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
