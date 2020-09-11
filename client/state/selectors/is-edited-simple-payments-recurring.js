/**
 * External dependencies
 */
import { get } from 'lodash';

import 'state/form/init';

export default function isEditedSimplePaymentsRecurring( state, formName ) {
	return !! get( state, [ 'form', formName, 'values', 'recurring' ], false );
}
