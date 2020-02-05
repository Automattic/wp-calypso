/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, SiteVertical } from './types';
import * as Actions from './actions';

const domain: Reducer<
	import('@automattic/data-stores').DomainSuggestions.DomainSuggestion | undefined,
	ReturnType< typeof Actions[ 'setDomain' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_DOMAIN ) {
		return action.domain;
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return undefined;
	}
	return state;
};

const selectedDesign: Reducer<
	import('@automattic/data-stores').VerticalsTemplates.Template | undefined,
	ReturnType< typeof Actions[ 'setSelectedDesign' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_SELECTED_DESIGN ) {
		return action.selectedDesign;
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return undefined;
	}
	return state;
};

const siteTitle: Reducer<
	string,
	ReturnType< typeof Actions[ 'setSiteTitle' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = '', action ) => {
	if ( action.type === ActionType.SET_SITE_TITLE ) {
		return action.siteTitle;
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return '';
	}
	return state;
};

const siteVertical: Reducer<
	SiteVertical | undefined,
	ReturnType<
		| typeof Actions[ 'setSiteVertical' ]
		| typeof Actions[ 'resetSiteVertical' ]
		| typeof Actions[ 'resetOnboardStore' ]
	>
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_SITE_VERTICAL ) {
		return action.siteVertical;
	}
	if (
		action.type === ActionType.RESET_SITE_VERTICAL ||
		action.type === ActionType.RESET_ONBOARD_STORE
	) {
		return undefined;
	}
	return state;
};

const pageLayouts: Reducer<
	string[],
	ReturnType< typeof Actions[ 'togglePageLayout' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = [], action ) => {
	if ( action.type === ActionType.TOGGLE_PAGE_LAYOUT ) {
		const layout = action.pageLayout;
		if ( state.includes( layout.slug ) ) {
			return state.filter( item => item !== layout.slug );
		}
		return [ ...state, layout.slug ];
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return [];
	}
	return state;
};

const shouldCreate: Reducer<
	boolean,
	ReturnType< typeof Actions[ 'setShouldCreate' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = false, action ) => {
	if ( action.type === ActionType.SET_SHOULD_CREATE ) {
		return action.shouldCreate;
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return false;
	}
	return state;
};

const isSiteCreated: Reducer<
	boolean,
	ReturnType< typeof Actions[ 'setIsSiteCreated' ] | typeof Actions[ 'resetOnboardStore' ] >
> = ( state = false, action ) => {
	if ( action.type === ActionType.SET_IS_SITE_CREATED ) {
		return action.isSiteCreated;
	}
	if ( action.type === ActionType.RESET_ONBOARD_STORE ) {
		return false;
	}
	return state;
};

const reducer = combineReducers( {
	domain,
	selectedDesign,
	siteTitle,
	siteVertical,
	pageLayouts,
	shouldCreate,
	isSiteCreated,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
