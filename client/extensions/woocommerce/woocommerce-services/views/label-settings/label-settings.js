/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getPaperSizes } from '../../lib/pdf-label-utils';
import PaymentMethod, { getPaymentMethodTitle } from './label-payment-method';
import Button from 'components/button';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

class ShippingLabels extends Component {
	componentWillMount() {
		this.setState( { expanded: this.isExpanded( this.props ) } );
	}

	componentWillReceiveProps( props ) {
		if ( props.selectedPaymentMethod !== this.props.selectedPaymentMethod ) {
			this.setState( { expanded: this.isExpanded( props ) } );
		}
	}

	isExpanded( { pristine, selectedPaymentMethod } ) {
		return ! selectedPaymentMethod || ! pristine;
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
					<FormLabel
						className="label-settings__cards-label">
						<span />
					</FormLabel>
					<p className="label-settings__credit-card-description">
					</p>
					<PaymentMethod selected={ false } isLoading={ true } />
					<PaymentMethod selected={ false } isLoading={ true } />
					<Button compact />
				</FormFieldSet>
			</div>
		);
	}

	renderPaymentsSection = () => {
		const { paymentMethods, setFormDataValue, selectedPaymentMethod, translate } = this.props;

		if ( ! this.state.expanded ) {
			const expand = ( event ) => {
				event.preventDefault();
				this.setState( { expanded: true } );
			};

			const {
				card_type: selectedType,
				card_digits: selectedDigits,
			} = find( paymentMethods, { payment_method_id: selectedPaymentMethod } );

			return (
				<div>
					<p className="label-settings__credit-card-description">
						{ translate( 'We\'ll charge the credit card on your ' +
							'account (%(card)s) to pay for the labels you print', { args: {
								card: getPaymentMethodTitle( translate, selectedType, selectedDigits ),
							} } ) }
					</p>
					<p className="label-settings__credit-card-description">
						<a href="#" onClick={ expand }>{ translate( 'Choose a different card' ) }</a>
					</p>
				</div>
			);
		}

		const onPaymentMethodChange = ( value ) => setFormDataValue( 'selected_payment_method_id', value );

		let description, buttonLabel;
		if ( paymentMethods.length ) {
			description = translate( 'To purchase shipping labels, choose a credit card you have on file or add a new card.' );
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
					onSelect={ onSelect } />
			);
		};

		return (
			<div>
				<p className="label-settings__credit-card-description">
					{ description }
				</p>
				{ paymentMethods.map( renderPaymentMethod ) }
				<Button href="/me/billing" target="_blank" compact>
					{ buttonLabel }
				</Button>
			</div>
		);
	};

	renderContent = () => {
		const { isLoading, setFormDataValue, paperSize, storeOptions, translate } = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		const onPaperSizeChange = ( event ) => setFormDataValue( 'paper_size', event.target.value );
		const paperSizes = getPaperSizes( storeOptions.origin_country );

		return (
			<div>
				<FormFieldSet>
					<FormLabel
						className="label-settings__cards-label">
						{ translate( 'Paper size' ) }
					</FormLabel>
					<FormSelect onChange={ onPaperSizeChange } value={ paperSize }>
						{ Object.keys( paperSizes ).map( ( size ) => (
							<option value={ size } key={ size }>{ paperSizes[ size ] }</option>
						) ) }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel
						className="label-settings__cards-label">
						{ translate( 'Payment' ) }
					</FormLabel>
					{ this.renderPaymentsSection() }
				</FormFieldSet>

			</div>
		);
	};

	render() {
		return (
			<div className="label-settings__labels-container">
				{ this.renderContent() }
			</div>
		);
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
};

export default localize( ShippingLabels );
