/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isEditedSimplePaymentsRecurring( state, formName ) {
	return !! get( state, [ 'form', formName, 'values', 'recurring' ], false );
}
