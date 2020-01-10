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
	ReturnType< typeof Actions[ 'setDomain' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_DOMAIN ) {
		return action.domain;
	}
	return state;
};

const selectedDesign: Reducer<
	import('@automattic/data-stores').VerticalsTemplates.Template | undefined,
	ReturnType< typeof Actions[ 'setSelectedDesign' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_SELECTED_DESIGN ) {
		return action.selectedDesign;
	}
	return state;
};

const siteTitle: Reducer< string, ReturnType< typeof Actions[ 'setSiteTitle' ] > > = (
	state = '',
	action
) => {
	if ( action.type === ActionType.SET_SITE_TITLE ) {
		return action.siteTitle;
	}
	return state;
};

const siteVertical: Reducer<
	SiteVertical | undefined,
	ReturnType< typeof Actions[ 'setSiteVertical' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.SET_SITE_VERTICAL ) {
		return action.siteVertical;
	}
	if ( action.type === ActionType.RESET_SITE_VERTICAL ) {
		return undefined;
	}
	return state;
};

const pageLayouts: Reducer<
	string[],
	ReturnType< typeof Actions[ 'togglePageLayout' ] >
> = ( state = [], action ) => {
	if ( action.type === ActionType.TOGGLE_PAGE_LAYOUT ) {
		const layout = action.pageLayout;
		if ( state.includes( layout.slug ) ) {
			return state.filter( item => item !== layout.slug );
		}
		return [ ...state, layout.slug ];
	}
	return state;
};

const reducer = combineReducers( { domain, selectedDesign, siteTitle, siteVertical, pageLayouts } );

export type State = ReturnType< typeof reducer >;

export default reducer;
