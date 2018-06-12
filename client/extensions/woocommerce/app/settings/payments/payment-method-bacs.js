/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextarea from 'components/forms/form-textarea';
import FormPasswordInput from 'components/forms/form-password-input';
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
					id: PropTypes.string,
					value: PropTypes.arrayOf(
						PropTypes.shape( {
							account_name: PropTypes.string,
							account_number: PropTypes.string,
							bank_name: PropTypes.string,
							bic: PropTypes.string,
							iban: PropTypes.string,
							sort_code: PropTypes.string,
						} )
					),
				} ),
			} ),
		} ),
		translate: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { iban, bic } = this.getAccountData( props );
		this.state = {
			showInternational: ( iban && iban.length ) || ( bic && bic.length ),
		};
	}

	getAccountData = props => {
		const {
			method: { settings },
		} =
			props || this.props;
		const accountData = get( settings, [ 'accounts', 'value' ], [] );

		return accountData.length
			? accountData[ 0 ]
			: {
					account_name: '',
					account_number: '',
					bank_name: '',
					bic: '',
					iban: '',
					sort_code: '',
			  };
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

	updateInternationalVisibility = () => {
		this.setState( {
			showInternational: ! this.state.showInternational,
		} );
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
		const {
			method,
			method: { settings },
			translate,
		} = this.props;
		const accountData = this.getAccountData();
		const { showInternational } = this.state;
		const classes = classNames( 'payments__dialog woocommerce', {
			'show-international-options': showInternational,
		} );

		return (
			<Dialog additionalClassNames={ classes } buttons={ this.buttons } isVisible>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Title' ) }</FormLabel>
					<FormTextInput
						name="title"
						onChange={ this.onEditFieldHandler }
						value={ settings.title.value }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Account Details' ) }</FormLabel>
					{ translate(
						"These are the details of the bank account you'd like your customers to pay in to."
					) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Account Name' ) }</FormLabel>
					<FormTextInput
						name="account_name"
						onChange={ this.onEditAccountHandler }
						value={ accountData.account_name }
					/>
					<FormSettingExplanation>
						{ translate( 'This is for your reference' ) }
					</FormSettingExplanation>
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
					<FormPasswordInput
						name="sort_code"
						onChange={ this.onEditAccountHandler }
						value={ accountData.sort_code }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Account Number' ) }</FormLabel>
					<FormPasswordInput
						name="account_number"
						onChange={ this.onEditAccountHandler }
						value={ accountData.account_number }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						<FormCheckbox
							className="payments__edit-international-options-checkbox"
							checked={ showInternational }
							onChange={ this.updateInternationalVisibility }
						/>
						{ translate( 'I want to offer BACS payment as an option to international customers' ) }
					</FormLabel>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container is-international-option">
					<FormLabel>{ translate( 'IBAN' ) }</FormLabel>
					<FormTextInput
						name="iban"
						onChange={ this.onEditAccountHandler }
						value={ accountData.iban }
					/>
					<FormSettingExplanation>
						{ translate( 'You can obtain your IBAN number from your bank' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container is-international-option">
					<FormLabel>{ translate( 'BIC / Swift' ) }</FormLabel>
					<FormTextInput
						name="bic"
						onChange={ this.onEditAccountHandler }
						value={ accountData.bic }
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
			</Dialog>
		);
	}
}

export default localize( PaymentMethodBACS );
