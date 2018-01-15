/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { INIT_FORM, SET_FORM_PROPERTY, SET_ALL_PRISTINE } from './actions';
import initializeState from 'woocommerce/woocommerce-services/lib/initialize-form-state';
import values from './values/reducer';
import * as formValueActions from './values/actions';

const reducers = {};

reducers[ INIT_FORM ] = ( state, { formSchema, formData, formLayout, storeOptions, noticeDismissed } ) => {
	return {
		...state,
		...initializeState( formSchema, formData, formLayout, storeOptions, noticeDismissed ),
	};
};

reducers[ SET_FORM_PROPERTY ] = ( state, action ) => {
	const newObj = {};
	newObj[ action.field ] = action.value;
	if ( 'success' === action.field && action.value ) {
		newObj.pristine = mapValues( state.pristine, () => true );
	}
	return Object.assign( {}, state, newObj );
};

reducers[ SET_ALL_PRISTINE ] = ( state, action ) => ( {
	...state,
	pristine: mapValues( state.pristine, () => action.pristineValue ),
} );

export default function form( state = {}, action ) {
	let newState = Object.assign( {}, state );

	if ( 'function' === typeof reducers[ action.type ] ) {
		newState = reducers[ action.type ]( state, action );
	}

	if ( formValueActions[ action.type ] ) {
		newState.pristine = { ...state.pristine, [ action.path ]: false };

		// Allow client-side form validation to take over error state when inputs change
		delete newState.error;
		delete newState.fieldsStatus;

		newState = Object.assign( newState, {
			values: values( state.values || {}, action ),
		} );
	}

	return newState;
}
