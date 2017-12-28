/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldSet from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import FormTextInput from 'client/components/forms/form-text-input';
import PriceInput from 'client/extensions/woocommerce/components/price-input';
import { bindActionCreatorsWithSiteId } from 'client/extensions/woocommerce/lib/redux-utils';
import { setShippingCost } from 'client/extensions/woocommerce/state/ui/shipping/zones/methods/flat-rate/actions';

const FreeShippingMethod = ( { id, cost, currency, translate, actions } ) => {
	const isAdvancedSettings = cost && isString( cost ) && isNaN( cost );
	const onCostChange = event => actions.setShippingCost( id, event.target.value );

	const renderCostInput = () => {
		if ( isAdvancedSettings ) {
			return <FormTextInput value={ cost } onChange={ onCostChange } />;
		}

		return (
			<PriceInput currency={ currency } value={ cost } onChange={ onCostChange } min={ 0.01 } />
		);
	};

	return (
		<div>
			<FormFieldSet>
				<FormLabel>{ translate( 'Cost' ) }</FormLabel>
				{ renderCostInput() }
			</FormFieldSet>
		</div>
	);
};

FreeShippingMethod.propTypes = {
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
} ) )( localize( FreeShippingMethod ) );
