import { combineReducers } from '@wordpress/data';
import {
	CurrentTheme,
	NewSiteBlogDetails,
	NewSiteErrorResponse,
	SiteDetails,
	SiteError,
	Domain,
	SiteLaunchState,
	SiteLaunchStatus,
	SiteSettings,
	AtomicTransferStatus,
	LatestAtomicTransferStatus,
	GlobalStyles,
} from './types';
import {
	AtomicTransferState,
	LatestAtomicTransferState,
	AtomicSoftwareStatusState,
	AtomicSoftwareInstallState,
	AtomicSoftwareInstallStatus,
} from '.';
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

export const fetchingSiteError: Reducer< SiteError | undefined, Action > = ( state, action ) => {
	switch ( action.type ) {
		case 'RECEIVE_SITE_FAILED':
			return {
				error: action.response.error,
				message: action.response.message,
			};
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
	if ( action.type === 'UPDATE_SITE_SETTINGS' ) {
		return {
			...state,
			[ action.siteId ]: {
				...state?.[ action.siteId ],
				...action.settings,
			},
		};
	}
	return state;
};

export const siteTheme: Reducer< { [ key: number ]: CurrentTheme }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE_THEME' ) {
		return { ...state, [ action.siteId ]: action.theme };
	}
	return state;
};

export const sitesGlobalStyles: Reducer< { [ key: number ]: GlobalStyles }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE_GLOBAL_STYLES' ) {
		return {
			...state,
			[ action.siteId ]: {
				...state?.[ action.siteId ],
				...action.globalStyles,
			},
		};
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
	{
		error?: string;
		message?: string;
	},
	{
		type: string;
		error?: string;
		message?: string;
	}
> = ( state = {}, action ) => {
	if ( action.type === 'SET_SITE_SETUP_ERROR' ) {
		const { error, message } = action;

		return {
			error,
			message,
		};
	}

	if ( action.type === 'CLEAR_SITE_SETUP_ERROR' ) {
		return {};
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
				transferIntent: action.transferIntent,
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
				transferIntent: action.transferIntent,
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

export const latestAtomicTransferStatus: Reducer<
	{ [ key: number ]: LatestAtomicTransferState },
	Action
> = ( state = {}, action ) => {
	if ( action.type === 'LATEST_ATOMIC_TRANSFER_START' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: LatestAtomicTransferStatus.IN_PROGRESS,
				transfer: undefined,
				errorCode: undefined,
			},
		};
	}
	if ( action.type === 'LATEST_ATOMIC_TRANSFER_SUCCESS' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: LatestAtomicTransferStatus.SUCCESS,
				transfer: action.transfer,
				errorCode: undefined,
			},
		};
	}
	if ( action.type === 'LATEST_ATOMIC_TRANSFER_FAILURE' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: LatestAtomicTransferStatus.FAILURE,
				transfer: undefined,
				errorCode: action.error,
			},
		};
	}
	return state;
};

export const atomicSoftwareStatus: Reducer<
	{ [ key: number ]: AtomicSoftwareStatusState },
	Action
> = ( state = {}, action ) => {
	if ( action.type === 'ATOMIC_SOFTWARE_STATUS_START' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: undefined,
					error: undefined,
				},
			},
		};
	}
	if ( action.type === 'ATOMIC_SOFTWARE_STATUS_SUCCESS' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: action.status,
					error: undefined,
				},
			},
		};
	}
	if ( action.type === 'ATOMIC_SOFTWARE_STATUS_FAILURE' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: undefined,
					error: action.error,
				},
			},
		};
	}
	return state;
};

export const atomicSoftwareInstallStatus: Reducer<
	{ [ key: number ]: AtomicSoftwareInstallState },
	Action
> = ( state = {}, action ) => {
	if ( action.type === 'ATOMIC_SOFTWARE_INSTALL_START' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: AtomicSoftwareInstallStatus.IN_PROGRESS,
					error: undefined,
				},
			},
		};
	}
	if ( action.type === 'ATOMIC_SOFTWARE_INSTALL_SUCCESS' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: AtomicSoftwareInstallStatus.SUCCESS,
					error: undefined,
				},
			},
		};
	}
	if ( action.type === 'ATOMIC_SOFTWARE_INSTALL_FAILURE' ) {
		return {
			...state,
			[ action.siteId ]: {
				[ action.softwareSet ]: {
					status: AtomicSoftwareInstallStatus.FAILURE,
					error: action.error,
				},
			},
		};
	}
	return state;
};

const bundledPluginSlug: Reducer< { [ key: string ]: string | undefined }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'SET_BUNDLED_PLUGIN_SLUG' ) {
		return {
			...state,
			[ action.siteSlug ]: action.pluginSlug,
		};
	}
	if ( action.type === 'RESET_SITE_STORE' ) {
		return {};
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
	fetchingSiteError,
	sites,
	launchStatus,
	sitesDomains,
	sitesSettings,
	siteTheme,
	sitesGlobalStyles,
	siteSetupErrors,
	atomicTransferStatus,
	latestAtomicTransferStatus,
	atomicSoftwareStatus,
	atomicSoftwareInstallStatus,
	bundledPluginSlug,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
