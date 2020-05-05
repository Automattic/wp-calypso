/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SERVICES_LABELS_INIT_FORM,
	WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE,
	WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY,
	WOOCOMMERCE_SERVICES_LABELS_RESTORE_PRISTINE,
	WOOCOMMERCE_SERVICES_LABELS_OPEN_ADD_CARD_DIALOG,
	WOOCOMMERCE_SERVICES_LABELS_CLOSE_ADD_CARD_DIALOG,
} from '../action-types';

export const initialState = {
	meta: {
		error: false,
		fieldsStatus: false,
		isSaving: false,
		isFetching: false,
		isLoaded: false,
		isFetchError: false,
		pristine: true,
	},
	data: null,
	pristineData: null,
};

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_LABELS_INIT_FORM ] = (
	state,
	{ storeOptions, formData, formMeta }
) => {
	return {
		...state,
		storeOptions,
		meta: {
			...state.meta,
			...formMeta,
			pristine: true,
			isLoaded: true,
		},
		data: {
			...state.data,
			...formData,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE ] = ( state, { key, value } ) => {
	const pristineData = state.meta.pristine ? state.data : state.pristineData;

	return {
		...state,
		meta: {
			...state.meta,
			pristine: false,
		},
		data: {
			...state.data,
			[ key ]: value,
		},
		pristineData,
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY ] = ( state, { key, value } ) => {
	return {
		...state,
		meta: {
			...state.meta,
			[ key ]: value,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_RESTORE_PRISTINE ] = ( state ) => {
	if ( state.meta.pristine ) {
		return state;
	}

	return {
		...state,
		meta: {
			...state.meta,
			pristine: true,
		},
		data: state.pristineData,
		pristineData: null,
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_OPEN_ADD_CARD_DIALOG ] = ( state ) => {
	return {
		...state,
		addCardDialog: true,
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_CLOSE_ADD_CARD_DIALOG ] = ( state ) => {
	return {
		...state,
		addCardDialog: null,
	};
};

const reducer = ( state = initialState, action ) => {
	if ( reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};

export default reducer;
