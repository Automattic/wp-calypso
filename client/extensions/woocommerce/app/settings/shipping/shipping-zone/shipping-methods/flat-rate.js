/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import PriceInput from 'woocommerce/components/price-input';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import {
	setShippingIsTaxable,
	setShippingCost
} from 'woocommerce/state/ui/shipping/zones/methods/flat-rate/actions';

const FreeShippingMethod = ( { id, cost, tax_status, currency, translate, actions } ) => {
	const isTaxable = 'taxable' === tax_status;
	const isAdvancedSettings = cost && isString( cost ) && isNaN( cost );
	const onTaxableChange = () => ( actions.setShippingIsTaxable( id, ! isTaxable ) );
	const onCostChange = ( event ) => ( actions.setShippingCost( id, event.target.value ) );

	const renderCostInput = () => {
		if ( isAdvancedSettings ) {
			return (
				<FormTextInput
					value={ cost }
					onChange={ onCostChange } />
			);
		}

		return (
			<PriceInput
				currency={ currency }
				value={ cost }
				onChange={ onCostChange } />
		);
	};

	return (
		<div>
			<FormFieldSet>
				<FormLabel>{ translate( 'Cost' ) }</FormLabel>
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
	tax_status: PropTypes.string,
	currency: PropTypes.string,
};

export default connect(
	null,
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			setShippingIsTaxable,
			setShippingCost
		}, dispatch, ownProps.siteId )
	} )
)( localize( FreeShippingMethod ) );
