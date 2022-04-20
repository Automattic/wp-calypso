import { combineReducers } from '@wordpress/data';
import {
	NewSiteBlogDetails,
	NewSiteErrorResponse,
	SiteDetails,
	Domain,
	SiteLaunchState,
	SiteLaunchStatus,
	SiteSettings,
	AtomicTransferStatus,
} from './types';
import { AtomicTransferState } from '.';
import type { Action } from './actions';
import type { Reducer } from 'redux';

export const newSiteData: Reducer< NewSiteBlogDetails | undefined, Action > = ( state, action ) => {
	if ( action.type === 'RECEIVE_NEW_SITE' ) {
		const { response } = action;
		return response.blog_details;
	} else if ( action.type === 'RECEIVE_NEW_SITE_FAILED' ) {
		return undefined;
	} else if ( action.type === 'RESET_SITE_STORE' ) {
		return undefined;
	}
	return state;
};

export const newSiteError: Reducer< NewSiteErrorResponse | undefined, Action > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
		case 'RECEIVE_NEW_SITE':
		case 'RESET_SITE_STORE':
		case 'RESET_RECEIVE_NEW_SITE_FAILED':
			return undefined;
		case 'RECEIVE_NEW_SITE_FAILED':
			return {
				error: action.error.error,
				status: action.error.status,
				statusCode: action.error.statusCode,
				name: action.error.name,
				message: action.error.message,
			};
	}
	return state;
};

export const isFetchingSite: Reducer< boolean | undefined, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
			return true;
		case 'RECEIVE_NEW_SITE':
		case 'RECEIVE_NEW_SITE_FAILED':
		case 'RESET_SITE_STORE':
		case 'RESET_RECEIVE_NEW_SITE_FAILED':
			return false;
	}
	return state;
};

export const isFetchingSiteDetails: Reducer< boolean | undefined, Action > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_SITE':
			return true;
		case 'RECEIVE_SITE':
		case 'RECEIVE_SITE_FAILED':
			return false;
	}
	return state;
};

export const sites: Reducer< { [ key: number | string ]: SiteDetails | undefined }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE' ) {
		if ( action.response ) {
			return { ...state, [ action.response.ID ]: action.response };
		}
		return state;
	} else if ( action.type === 'RECEIVE_SITE_FAILED' ) {
		const { [ action.siteId ]: idToBeRemoved, ...remainingState } = state;
		return { ...remainingState };
	} else if ( action.type === 'RESET_SITE_STORE' ) {
		return {};
	} else if ( action.type === 'RECEIVE_SITE_TITLE' ) {
		return {
			...state,
			[ action.siteId ]: { ...( state[ action.siteId ] as SiteDetails ), name: action.name },
		};
	} else if ( action.type === 'RECEIVE_SITE_TAGLINE' ) {
		return {
			...state,
			[ action.siteId ]: {
				...( state[ action.siteId ] as SiteDetails ),
				description: action.tagline ?? '',
			},
		};
	} else if ( action.type === 'RECEIVE_SITE_VERTICAL_ID' ) {
		return {
			...state,
			[ action.siteId ]: {
				...( state[ action.siteId ] as SiteDetails ),
				options: {
					...state[ action.siteId ]?.options,
					site_vertical_id: action.verticalId,
				},
			},
		};
	}
	return state;
};

export const sitesDomains: Reducer< { [ key: number ]: Domain[] }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE_DOMAINS' ) {
		return { ...state, [ action.siteId ]: action.domains };
	}
	return state;
};

export const sitesSettings: Reducer< { [ key: number ]: SiteSettings }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE_SETTINGS' ) {
		return { ...state, [ action.siteId ]: action.settings };
	}
	return state;
};

export const launchStatus: Reducer< { [ key: number ]: SiteLaunchState }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'LAUNCH_SITE_START' ) {
		return {
			...state,
			[ action.siteId ]: { status: SiteLaunchStatus.IN_PROGRESS, errorCode: undefined },
		};
	}
	if ( action.type === 'LAUNCH_SITE_SUCCESS' ) {
		return {
			...state,
			[ action.siteId ]: { status: SiteLaunchStatus.SUCCESS, errorCode: undefined },
		};
	}
	if ( action.type === 'LAUNCH_SITE_FAILURE' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: SiteLaunchStatus.FAILURE,
				errorCode: action.error,
			},
		};
	}
	return state;
};

export const siteSetupErrors: Reducer<
	{ [ key: number ]: any | undefined },
	{
		type: string;
		siteId: number;
		error?: string;
		message?: string;
	}
> = ( state = {}, action ) => {
	if ( action.type === 'SET_SITE_SETUP_ERROR' ) {
		const { siteId, error, message } = action;

		return {
			...state,
			[ siteId ]: {
				error,
				message,
			},
		};
	}

	if ( action.type === 'CLEAR_SITE_SETUP_ERROR' ) {
		const newState = {
			...state,
		};

		delete newState[ action.siteId ];
	}

	return state;
};

export const atomicTransferStatus: Reducer< { [ key: number ]: AtomicTransferState }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'ATOMIC_TRANSFER_START' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: AtomicTransferStatus.IN_PROGRESS,
				softwareSet: action.softwareSet,
				errorCode: undefined,
			},
		};
	}
	if ( action.type === 'ATOMIC_TRANSFER_SUCCESS' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: AtomicTransferStatus.SUCCESS,
				softwareSet: action.softwareSet,
				errorCode: undefined,
			},
		};
	}
	if ( action.type === 'ATOMIC_TRANSFER_FAILURE' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: AtomicTransferStatus.FAILURE,
				softwareSet: action.softwareSet,
				errorCode: action.error,
			},
		};
	}
	return state;
};

const newSite = combineReducers( {
	data: newSiteData,
	error: newSiteError,
	isFetching: isFetchingSite,
} );

const reducer = combineReducers( {
	isFetchingSiteDetails,
	newSite,
	sites,
	launchStatus,
	sitesDomains,
	sitesSettings,
	siteSetupErrors,
	atomicTransferStatus,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
