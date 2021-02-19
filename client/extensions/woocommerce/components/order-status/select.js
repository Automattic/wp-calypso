/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { getOrderStatusList } from 'woocommerce/lib/order-status';
import FormSelect from 'calypso/components/forms/form-select';

function OrderStatusSelect( { onChange, value } ) {
	const statuses = getOrderStatusList();

	return (
		<FormSelect id="select" value={ value } onChange={ onChange }>
			{ statuses.map( ( status, i ) => {
				return (
					<option key={ i } value={ status.value }>
						{ status.name }
					</option>
				);
			} ) }
		</FormSelect>
	);
}

export default OrderStatusSelect;
