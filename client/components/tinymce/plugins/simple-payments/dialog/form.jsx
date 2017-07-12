/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormToggle from 'components/forms/form-toggle';

const ProductImage = () => (
	<div className="editor-simple-payments-modal__product-image">
		<Gridicon icon="add-image" size={ 36 } />
	</div>
);

class ProductForm extends Component {
	render() {
		const { translate } = this.props;

		return (
			<form className="editor-simple-payments-modal__form">
				<ProductImage />
				<div className="editor-simple-payments-modal__form-fields">
					<FormFieldset>
						<FormLabel htmlFor="productname">{ translate( 'What are you selling?' ) }</FormLabel>
						<FormTextInput name="productname" id="productname" />
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
						<FormTextarea name="description" id="description" />
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="price">{ translate( 'Price' ) }</FormLabel>
						<FormCurrencyInput
							name="price"
							id="price"
							currencySymbolPrefix="$"
							placeholder="0.00"
						/>
					</FormFieldset>
					<FormFieldset>
						<FormToggle id="allowMultipleItems">
							{ translate( 'Allow people to buy more than one item at a time.' ) }
						</FormToggle>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
						<FormTextInput name="email" id="email" />
						<FormSettingExplanation>
							{ translate(
								'This is where PayPal will send your money.' +
									" To claim a payment, you'll need a PayPal account connected to a bank account.",
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</div>
			</form>
		);
	}
}

export default localize( ProductForm );
