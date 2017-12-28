/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldSet from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import PriceInput from 'client/extensions/woocommerce/components/price-input';
import { bindActionCreatorsWithSiteId } from 'client/extensions/woocommerce/lib/redux-utils';
import { setShippingCost } from 'client/extensions/woocommerce/state/ui/shipping/zones/methods/local-pickup/actions';

const LocalPickupMethod = ( { id, cost, currency, translate, actions } ) => {
	const onCostChange = event => actions.setShippingCost( id, event.target.value );

	return (
		<div className="shipping-methods__method-container shipping-methods__local-pickup">
			<FormFieldSet>
				<FormLabel>{ translate( 'How much will you charge for local pickup?' ) }</FormLabel>
				<PriceInput currency={ currency } value={ cost } onChange={ onCostChange } />
			</FormFieldSet>
		</div>
	);
};

LocalPickupMethod.propTypes = {
	siteId: PropTypes.number,
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	cost: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	currency: PropTypes.string,
};

export default connect( null, ( dispatch, ownProps ) => ( {
	actions: bindActionCreatorsWithSiteId(
		{
			setShippingCost,
		},
		dispatch,
		ownProps.siteId
	),
} ) )( localize( LocalPickupMethod ) );
