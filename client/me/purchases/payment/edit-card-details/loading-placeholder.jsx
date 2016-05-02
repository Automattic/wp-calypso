/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import titles from 'me/purchases/titles';

const EditCardDetailsLoadingPlaceholder = () => {
	return (
		<LoadingPlaceholder title={ titles.addCardDetails }>
			<Card className="edit-card-details__content">
				<div className="credit-card-form">
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
			</Card>

			<CompactCard className="edit-card-details__footer">
				<FormButton isPrimary={ false } />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

export default EditCardDetailsLoadingPlaceholder;
