/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormSelect from 'calypso/components/forms/form-select';

const CreditCardFormLoadingPlaceholder = () => {
	return (
		<div className="credit-card-form-fields__loading-placeholder">
			<div className="credit-card-form-fields__field">
				<FormTextInput />
			</div>

			<div className="credit-card-form-fields__field">
				<FormTextInput />
			</div>

			<div className="credit-card-form-fields__extras">
				<div className="credit-card-form-fields__field expiration-date">
					<FormTextInput />
				</div>

				<div className="credit-card-form-fields__field cvv">
					<FormTextInput />
				</div>

				<div className="credit-card-form-fields__field country">
					<FormSelect />
				</div>

				<div className="credit-card-form-fields__field postal-code">
					<FormTextInput />
				</div>
			</div>
		</div>
	);
};

export default CreditCardFormLoadingPlaceholder;
