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
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import PriceInput from 'woocommerce/components/price-input';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { setShippingCost } from 'woocommerce/state/ui/shipping/zones/methods/local-pickup/actions';

const LocalPickupMethod = ( { id, cost, currency, translate, actions } ) => {
	const onCostChange = ( event ) => actions.setShippingCost( id, event.target.value );

	return (
		<FormFieldSet>
			<FormLabel>{ translate( 'How much will you charge for local pickup?' ) }</FormLabel>
			<PriceInput currency={ currency } value={ cost } onChange={ onCostChange } />
		</FormFieldSet>
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
