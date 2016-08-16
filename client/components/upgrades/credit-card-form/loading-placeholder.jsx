/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';

const CreditCardFormLoadingPlaceholder = () => {
	return (
		<div className="credit-card-form__loading-placeholder">
			<div className="credit-card-form__field">
				<FormTextInput />
			</div>

			<div className="credit-card-form__field">
				<FormTextInput />
			</div>

			<div className="credit-card-form__extras">
				<div className="credit-card-form__field expiration-date">
					<FormTextInput />
				</div>

				<div className="credit-card-form__field cvv">
					<FormTextInput />
				</div>

				<div className="credit-card-form__field country">
					<FormSelect />
				</div>

				<div className="credit-card-form__field postal-code">
					<FormTextInput />
				</div>
			</div>
		</div>
	);
};

export default CreditCardFormLoadingPlaceholder;
