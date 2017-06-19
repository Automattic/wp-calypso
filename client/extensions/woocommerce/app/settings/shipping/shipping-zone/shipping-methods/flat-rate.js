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
import FormCheckbox from 'components/forms/form-checkbox';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import {
	setShippingIsTaxable,
	setShippingCost
} from 'woocommerce/state/ui/shipping/zones/methods/flat-rate/actions';

const FreeShippingMethod = ( { id, siteId, cost, tax_status, translate, actions } ) => {
	const isTaxable = 'taxable' === tax_status;
	const onTaxableChange = () => ( actions.setShippingIsTaxable( siteId, id, ! isTaxable ) );
	const onCostChange = ( event ) => ( actions.setShippingCost( siteId, id, event.target.value ) );

	const renderCostInput = () => {
		//TODO: remove hardcoded currency settings
		return <FormCurrencyInput
			currencySymbolPrefix={ '$' }
			currencySymbolSuffix={ '' }
			value={ cost }
			onChange={ onCostChange } />;
	};

	return (
		<div>
			<FormFieldSet>
				<FormLabel>{ translate( 'Cost:' ) }</FormLabel>
				{ renderCostInput() }
			</FormFieldSet>
			<FormFieldSet>
				<FormCheckbox
					checked={ isTaxable }
					className="shipping-methods__checkbox"
					onChange={ onTaxableChange } />
				{ translate( 'Taxable' ) }
			</FormFieldSet>
		</div>
	);
};

FreeShippingMethod.propTypes = {
	siteId: PropTypes.number,
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	cost: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	tax_status: PropTypes.string
};

export default connect(
	null,
	( dispatch ) => ( {
		actions: bindActionCreators( {
			setShippingIsTaxable,
			setShippingCost
		}, dispatch )
	} )
)( localize( FreeShippingMethod ) );
