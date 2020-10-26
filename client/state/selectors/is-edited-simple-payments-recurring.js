/**
 * External dependencies
 */
import { get } from 'lodash';

import 'calypso/state/form/init';

export default function isEditedSimplePaymentsRecurring( state, formName ) {
	return !! get( state, [ 'form', formName, 'values', 'recurring' ], false );
}
