/**
 * Internal dependencies
 */
import getItemValue from './get-item-value';

export default ( schema, values, layout, storeOptions, noticeDismissed ) => {
	if ( ! schema || ! values ) {
		return {
			isFetching: false,
			loaded: false,
		};
	}

	const formValues = {};
	const pristine = {};
	Object.keys( schema.properties ).forEach( ( key ) => {
		formValues[ key ] = getItemValue( schema.properties[ key ], values[ key ], schema.definitions );
		pristine[ key ] = true;
	} );

	return {
		isSaving: false,
		isFetching: false,
		loaded: true,
		pristine,
		currentStep: -1,
		values: formValues,
		shippingLabel: {},
		layout,
		schema,
		storeOptions,
		noticeDismissed,
	};
};
