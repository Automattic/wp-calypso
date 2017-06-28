/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import PriceInput from 'woocommerce/components/price-input';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import {
	setShippingIsTaxable,
	setShippingCost
} from 'woocommerce/state/ui/shipping/zones/methods/local-pickup/actions';

const LocalPickupMethod = ( { id, cost, tax_status, currency, translate, actions } ) => {
	const isTaxable = 'taxable' === tax_status;
	const onTaxableChange = () => ( actions.setShippingIsTaxable( id, ! isTaxable ) );
	const onCostChange = ( event ) => ( actions.setShippingCost( id, event.target.value ) );

	return (
		<div className="shipping-methods__method-container shipping-methods__local-pickup">
			<FormFieldSet>
				<FormLabel>{ translate( 'How much will you charge for local pickup?' ) }</FormLabel>
				<PriceInput
					currency={ currency }
					value={ cost }
					onChange={ onCostChange } />
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

LocalPickupMethod.propTypes = {
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
)( localize( LocalPickupMethod ) );
