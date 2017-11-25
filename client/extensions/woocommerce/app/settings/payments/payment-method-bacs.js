/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';

class PaymentMethodBACS extends Component {
	static propTypes = {
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				title: PropTypes.shape( {
					id: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					value: PropTypes.string.isRequired,
				} ),
				accounts: PropTypes.shape( {
					id: PropTypes.string.isRequired,
					value: PropTypes.array.isRequired,
				} ),
			} ),
		} ),
		translate: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
	};

	getAccountData = () => {
		const { method: { settings } } = this.props;

		// The API _should_ always return this, but just being safe.
		const accountData = get(
			settings,
			[ 'accounts', 'value' ],
			[
				{
					account_name: '',
					account_number: '',
					bank_name: '',
					bic: '',
					iban: '',
					sort_code: '',
				},
			]
		);

		return accountData.length ? accountData[ 0 ] : {};
	};

	onEditFieldHandler = e => {
		this.props.onEditField( e.target.name, e.target.value );
	};

	onEditAccountHandler = e => {
		const newValue = {};
		newValue[ e.target.name ] = e.target.value;
		const newAccount = Object.assign( {}, this.getAccountData(), newValue );
		this.props.onEditField( 'accounts', [ newAccount ] );
	};

	buttons = [
		{ action: 'cancel', label: this.props.translate( 'Cancel' ), onClick: this.props.onCancel },
		{
			action: 'save',
			label: this.props.translate( 'Done' ),
			onClick: this.props.onDone,
			isPrimary: true,
		},
	];

	render() {
		const { method, method: { settings }, translate } = this.props;
		const accountData = this.getAccountData();
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.buttons }
				isVisible
			>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Title' ) }</FormLabel>
					<FormTextInput
						name="title"
						onChange={ this.onEditFieldHandler }
						value={ settings.title.value }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Instructions for customer at checkout' ) }</FormLabel>
					<FormTextarea
						name="description"
						onChange={ this.onEditFieldHandler }
						value={ method.description }
						placeholder={ translate( 'Make your payment directly into our bank account.' ) }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ translate( 'Instructions for customer in order email notification' ) }
					</FormLabel>
					<FormTextarea
						name="instructions"
						onChange={ this.onEditFieldHandler }
						value={ settings.instructions.value }
						placeholder={ translate( 'Use these bank account details…' ) }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLegend>
						{ translate( 'Account Details', { note: 'Fieldset legend for bank account details' } ) }
					</FormLegend>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'Account Name' ) }</FormLabel>
						<FormTextInput
							name="account_name"
							onChange={ this.onEditAccountHandler }
							value={ accountData.account_name }
						/>
					</FormFieldset>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'Account Number' ) }</FormLabel>
						<FormTextInput
							name="account_number"
							onChange={ this.onEditAccountHandler }
							value={ accountData.account_number }
						/>
					</FormFieldset>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'Bank Name' ) }</FormLabel>
						<FormTextInput
							name="bank_name"
							onChange={ this.onEditAccountHandler }
							value={ accountData.bank_name }
						/>
					</FormFieldset>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'Routing Number' ) }</FormLabel>
						<FormTextInput
							name="sort_code"
							onChange={ this.onEditAccountHandler }
							value={ accountData.sort_code }
						/>
					</FormFieldset>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'IBAN' ) }</FormLabel>
						<FormTextInput
							name="iban"
							onChange={ this.onEditAccountHandler }
							value={ accountData.iban }
						/>
					</FormFieldset>
					<FormFieldset className="payments__method-edit-field-container">
						<FormLabel>{ translate( 'BIC / Swift' ) }</FormLabel>
						<FormTextInput
							name="bic"
							onChange={ this.onEditAccountHandler }
							value={ accountData.bic }
						/>
					</FormFieldset>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodBACS );
