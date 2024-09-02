import { omit } from 'lodash';
import {
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
} from 'calypso/state/themes/action-types';
import { combineReducers } from 'calypso/state/utils';

export const uploadedThemeId = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_UPLOAD_SUCCESS: {
			const { siteId, themeId } = action;

			return {
				...state,
				[ siteId ]: themeId,
			};
		}
		case THEME_TRANSFER_STATUS_RECEIVE: {
			const { siteId, themeId } = action;

			return {
				...state,
				[ siteId ]: themeId,
			};
		}
		case THEME_UPLOAD_CLEAR: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_UPLOAD_START: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_TRANSFER_INITIATE_REQUEST: {
			const { siteId } = action;
			return omit( state, siteId );
		}
	}

	return state;
};

export const uploadError = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_UPLOAD_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: error,
			};
		}
		case THEME_TRANSFER_STATUS_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: error,
			};
		}
		case THEME_TRANSFER_INITIATE_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: error,
			};
		}
		case THEME_UPLOAD_CLEAR: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_UPLOAD_START: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_TRANSFER_INITIATE_REQUEST: {
			const { siteId } = action;
			return omit( state, siteId );
		}
	}

	return state;
};

export const progressLoaded = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_UPLOAD_PROGRESS: {
			const { siteId, loaded } = action;

			return {
				...state,
				[ siteId ]: loaded,
			};
		}
		case THEME_TRANSFER_INITIATE_PROGRESS: {
			const { siteId, loaded } = action;

			return {
				...state,
				[ siteId ]: loaded,
			};
		}
		case THEME_UPLOAD_CLEAR: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_UPLOAD_START: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_TRANSFER_INITIATE_REQUEST: {
			const { siteId } = action;
			return omit( state, siteId );
		}
	}

	return state;
};

export const progressTotal = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_UPLOAD_PROGRESS: {
			const { siteId, total } = action;

			return {
				...state,
				[ siteId ]: total,
			};
		}
		case THEME_TRANSFER_INITIATE_PROGRESS: {
			const { siteId, total } = action;

			return {
				...state,
				[ siteId ]: total,
			};
		}
		case THEME_UPLOAD_CLEAR: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_UPLOAD_START: {
			const { siteId } = action;
			return omit( state, siteId );
		}
		case THEME_TRANSFER_INITIATE_REQUEST: {
			const { siteId } = action;
			return omit( state, siteId );
		}
	}

	return state;
};

export const inProgress = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_UPLOAD_START: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case THEME_TRANSFER_INITIATE_REQUEST: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case THEME_UPLOAD_CLEAR: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case THEME_UPLOAD_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case THEME_UPLOAD_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case THEME_TRANSFER_STATUS_RECEIVE: {
			const { siteId, status } = action;

			return {
				...state,
				[ siteId ]: status !== 'complete',
			};
		}
		case THEME_TRANSFER_INITIATE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case THEME_TRANSFER_STATUS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
};

export const isTransferComplete = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_TRANSFER_STATUS_RECEIVE: {
			const { siteId, status } = action;

			return {
				...state,
				[ siteId ]: status === 'complete',
			};
		}
	}

	return state;
};

export const isTransferInProgress = ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_TRANSFER_INITIATE_REQUEST:
		case THEME_TRANSFER_INITIATE_PROGRESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case THEME_TRANSFER_INITIATE_FAILURE:
		case THEME_TRANSFER_STATUS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case THEME_TRANSFER_STATUS_RECEIVE: {
			const { siteId, status } = action;

			return {
				...state,
				[ siteId ]: status !== 'complete',
			};
		}
	}

	return state;
};

export default combineReducers( {
	uploadedThemeId,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
	isTransferComplete,
	isTransferInProgress,
} );
