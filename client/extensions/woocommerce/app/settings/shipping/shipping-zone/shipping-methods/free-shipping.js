/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSelect from 'components/forms/form-select';
import {
	setFreeShippingCondition,
	setFreeShippingMinCost
} from 'woocommerce/state/ui/shipping/zones/methods/free-shipping/actions';

const FreeShippingMethod = ( { id, siteId, requires, min_amount, translate, actions } ) => {
	const onConditionChange = ( event ) => ( actions.setFreeShippingCondition( siteId, id, event.target.value ) );
	const onMinAmountChange = ( event ) => ( actions.setFreeShippingMinCost( siteId, id, event.target.value ) );

	const isAdvancedSettings = 'coupon' === requires || 'either' === requires || 'both' === requires;

	const renderMinSpendInput = () => (
		//TODO: remove hardcoded currency settings
		<FormCurrencyInput
			currencySymbolPrefix={ '$' }
			currencySymbolSuffix={ '' }
			value={ min_amount }
			disabled={ ! requires }
			onChange={ onMinAmountChange } />
	);

	if ( isAdvancedSettings ) {
		const renderMinSpendControls = () => {
			if ( ! requires || 'coupon' === requires ) {
				return null;
			}

			return (
				<FormFieldSet>
					<FormLabel>{ translate( 'Minimum order amount:' ) }</FormLabel>
					{ renderMinSpendInput() }
				</FormFieldSet>
			);
		};

		return (
			<div>
				<FormFieldSet>
					<FormLabel>{ translate( 'Free shipping requires:' ) }</FormLabel>
					<FormSelect value={ requires } onChange={ onConditionChange }>
						<option value="">{ translate( 'N/A' ) }</option>
						<option value="coupon">{ translate( 'A valid free shipping coupon' ) }</option>
						<option value="min_amount">{ translate( 'A minimum order amount' ) }</option>
						<option value="either">{ translate( 'A minimum order amount OR a coupon' ) }</option>
						<option value="both">{ translate( 'A minimum order amount AND a coupon' ) }</option>
					</FormSelect>
				</FormFieldSet>
				{ renderMinSpendControls() }
			</div>
		);
	}

	return (
		<FormFieldSet>
			<FormLabel>{ translate( 'Who gets free shipping?' ) }</FormLabel>
			<div className="shipping-methods__free-shipping-option">
				<FormRadio
					value=""
					checked={ ! requires }
					onChange={ onConditionChange } />
				{ translate( 'Everyone!' ) }
			</div>
			<div className="shipping-methods__free-shipping-option">
				<FormRadio
					value="min_amount"
					checked={ requires }
					onChange={ onConditionChange } />
				{ translate( 'Customers that spend {{priceInput/}} or more per order', {
					components: {
						priceInput: renderMinSpendInput()
					}
				} ) }
			</div>
		</FormFieldSet>
	);
};

FreeShippingMethod.propTypes = {
	siteId: PropTypes.number,
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	requires: PropTypes.string,
	min_amount: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] )
};

export default connect(
	null,
	( dispatch ) => ( {
		actions: bindActionCreators( {
			setFreeShippingCondition,
			setFreeShippingMinCost
		}, dispatch )
	} )
)( localize( FreeShippingMethod ) );
