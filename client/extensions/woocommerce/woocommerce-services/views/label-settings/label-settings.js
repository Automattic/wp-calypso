/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, isBoolean } from 'lodash';

/**
 * Internal dependencies
 */
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import Notice from 'components/notice';
import PaymentMethod, { getPaymentMethodTitle } from './label-payment-method';
import { getOrigin } from 'woocommerce/lib/nav-utils';

class ShippingLabels extends Component {
	componentWillMount() {
		this.setState( { expanded: this.isExpanded( this.props ) } );
	}

	componentWillReceiveProps( props ) {
		if ( props.selectedPaymentMethod !== this.props.selectedPaymentMethod ) {
			this.setState( { expanded: this.isExpanded( props ) } );
		}
	}

	isExpanded( { canEditPayments, pristine, selectedPaymentMethod } ) {
		return canEditPayments && ( ! selectedPaymentMethod || ! pristine );
	}

	renderPlaceholder() {
		return (
			<div className="label-settings__placeholder">
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">
						<span />
					</FormLabel>
					<FormSelect />
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">
						<span />
					</FormLabel>
					<p className="label-settings__credit-card-description" />
					<PaymentMethod selected={ false } isLoading={ true } />
					<PaymentMethod selected={ false } isLoading={ true } />
					<Button compact />
				</FormFieldSet>
			</div>
		);
	}

	renderPaymentPermissionNotice = () => {
		const {
			canEditPayments,
			canEditSettings,
			masterUserName,
			masterUserLogin,
			translate,
		} = this.props;

		// If the user can's edit any settings, there will be another notice for the whole section
		if ( ! canEditSettings || canEditPayments ) {
			return null;
		}

		return (
			<Notice showDismiss={ false }>
				{ translate(
					'Only the site owner can manage shipping label payment methods. Please' +
						' contact %(ownerName)s (%(ownerLogin)s) to manage payment methods.',
					{
						args: {
							ownerName: masterUserName,
							ownerLogin: masterUserLogin,
						},
					}
				) }
			</Notice>
		);
	};

	renderSettingsPermissionNotice = () => {
		const { canEditSettings, masterUserName, masterUserLogin, translate } = this.props;
		if ( canEditSettings ) {
			return null;
		}

		return (
			<Notice showDismiss={ false }>
				{ translate(
					'Only the site owner can change these settings. Please contact %(ownerName)s (%(ownerLogin)s)' +
						' to change the shipping label settings.',
					{
						args: {
							ownerName: masterUserName,
							ownerLogin: masterUserLogin,
						},
					}
				) }
			</Notice>
		);
	};

	renderPaymentsSection = () => {
		const {
			canEditPayments,
			paymentMethods,
			setFormDataValue,
			selectedPaymentMethod,
			translate,
		} = this.props;

		if ( ! this.state.expanded ) {
			const expand = event => {
				event.preventDefault();
				this.setState( { expanded: true } );
			};

			let summary;

			if ( selectedPaymentMethod ) {
				const { card_type: selectedType, card_digits: selectedDigits } = find( paymentMethods, {
					payment_method_id: selectedPaymentMethod,
				} );

				summary = translate(
					"We'll charge the credit card on your " +
						'account (%(card)s) to pay for the labels you print',
					{
						args: {
							card: getPaymentMethodTitle( translate, selectedType, selectedDigits ),
						},
					}
				);
			} else {
				summary = translate( 'To purchase shipping labels, add a credit card.' );
			}

			return (
				<div>
					{ this.renderPaymentPermissionNotice() }
					<p className="label-settings__credit-card-description">{ summary }</p>
					{ canEditPayments && (
						<p className="label-settings__credit-card-description">
							<a href="#" onClick={ expand }>
								{ translate( 'Choose a different card' ) }
							</a>
						</p>
					) }
				</div>
			);
		}

		const onPaymentMethodChange = value => setFormDataValue( 'selected_payment_method_id', value );

		let description, buttonLabel;
		if ( paymentMethods.length ) {
			description = translate(
				'To purchase shipping labels, choose a credit card you have on file or add a new card.'
			);
			buttonLabel = translate( 'Add another credit card' );
		} else {
			description = translate( 'To purchase shipping labels, add a credit card.' );
			buttonLabel = translate( 'Add a credit card' );
		}

		const renderPaymentMethod = ( method, index ) => {
			const onSelect = () => onPaymentMethodChange( method.payment_method_id );
			return (
				<PaymentMethod
					key={ index }
					selected={ selectedPaymentMethod === method.payment_method_id }
					type={ method.card_type }
					name={ method.name }
					digits={ method.card_digits }
					expiry={ method.expiry }
					onSelect={ onSelect }
				/>
			);
		};

		return (
			<div>
				{ this.renderPaymentPermissionNotice() }
				<p className="label-settings__credit-card-description">{ description }</p>
				{ paymentMethods.map( renderPaymentMethod ) }
				<Button href={ getOrigin() + '/me/purchases/add-credit-card' } target="_blank" compact>
					{ buttonLabel }
				</Button>
			</div>
		);
	};

	renderEmailReceiptsSection = () => {
		const {
			emailReceipts,
			translate,
			masterUserName,
			masterUserLogin,
			canEditSettings,
			canEditPayments,
			setFormDataValue,
		} = this.props;

		if ( ! isBoolean( emailReceipts ) ) {
			return null;
		}

		const onChange = () => setFormDataValue( 'email_receipts', ! emailReceipts );

		return (
			<FormFieldSet>
				<FormLabel className="label-settings__cards-label">
					{ translate( 'Email Receipts' ) }
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						checked={ emailReceipts }
						onChange={ onChange }
						disabled={ ! canEditPayments && ! canEditSettings }
					/>
					<span className="label-settings__credit-card-description">
						{ translate( 'Email the label purchase receipts to %(ownerName)s (%(ownerLogin)s)', {
							args: {
								ownerName: masterUserName,
								ownerLogin: masterUserLogin,
							},
						} ) }
					</span>
				</FormLabel>
			</FormFieldSet>
		);
	};

	renderContent = () => {
		const {
			canEditSettings,
			isLoading,
			setFormDataValue,
			paperSize,
			storeOptions,
			translate,
		} = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		const onPaperSizeChange = event => setFormDataValue( 'paper_size', event.target.value );
		const paperSizes = getPaperSizes( storeOptions.origin_country );

		return (
			<div>
				<FormFieldSet>
					{ this.renderSettingsPermissionNotice() }
					<FormLabel className="label-settings__cards-label">
						{ translate( 'Paper size' ) }
					</FormLabel>
					<FormSelect
						onChange={ onPaperSizeChange }
						value={ paperSize }
						disabled={ ! canEditSettings }
					>
						{ Object.keys( paperSizes ).map( size => (
							<option value={ size } key={ size }>
								{ paperSizes[ size ] }
							</option>
						) ) }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">{ translate( 'Payment' ) }</FormLabel>
					{ this.renderPaymentsSection() }
				</FormFieldSet>
				{ this.renderEmailReceiptsSection() }
			</div>
		);
	};

	render() {
		return <div className="label-settings__labels-container">{ this.renderContent() }</div>;
	}
}

ShippingLabels.propTypes = {
	isLoading: PropTypes.bool,
	pristine: PropTypes.bool,
	paymentMethods: PropTypes.array,
	setFormDataValue: PropTypes.func,
	selectedPaymentMethod: PropTypes.number,
	paperSize: PropTypes.string,
	storeOptions: PropTypes.object,
	canEditPayments: PropTypes.bool,
	canEditSettings: PropTypes.bool,
	masterUserName: PropTypes.string,
	masterUserLogin: PropTypes.string,
	emailReceipts: PropTypes.bool,
};

export default localize( ShippingLabels );
