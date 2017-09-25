/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SERVICES_LABELS_INIT_FORM, WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE, WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY } from '../action-types';

export const initialState = {
	meta: {
		error: false,
		fieldsStatus: false,
		isSaving: false,
		isFetching: false,
		pristine: true,
	},
	data: null,
};

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_LABELS_INIT_FORM ] = ( state, { storeOptions, formData, formMeta } ) => {
	return { ...state,
		storeOptions,
		meta: { ...state.meta,
			...formMeta,
			pristine: true,
		},
		data: { ...state.data,
			...formData,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE ] = ( state, { key, value } ) => {
	return { ...state,
		meta: { ...state.meta,
			pristine: false,
		},
		data: { ...state.data,
			[ key ]: value,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY ] = ( state, { key, value } ) => {
	return { ...state,
		meta: { ...state.meta,
			[ key ]: value,
		},
	};
};

const reducer = ( state = initialState, action ) => {
	if ( reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};

export default reducer;
