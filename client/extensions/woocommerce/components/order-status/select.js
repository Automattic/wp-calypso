/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { getOrderStatusList } from 'client/extensions/woocommerce/lib/order-status';
import FormSelect from 'client/components/forms/form-select';

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
