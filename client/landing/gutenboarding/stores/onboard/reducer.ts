/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, OnboardAction, SiteVertical } from './types';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;
type Template = import('@automattic/data-stores').VerticalsTemplates.Template;

function domain( state: DomainSuggestion | undefined, action: OnboardAction ) {
	if ( action.type === ActionType.SET_DOMAIN ) {
		return action.domain;
	}
	return state;
}

function selectedDesign( state: Template | undefined, action: OnboardAction ) {
	if ( action.type === ActionType.SET_SELECTED_DESIGN ) {
		return action.selectedDesign;
	}
	return state;
}

function siteTitle( state = '', action: OnboardAction ) {
	if ( action.type === ActionType.SET_SITE_TITLE ) {
		return action.siteTitle;
	}
	return state;
}

function siteVertical( state: SiteVertical | undefined, action: OnboardAction ) {
	if ( action.type === ActionType.SET_SITE_VERTICAL ) {
		return action.siteVertical;
	}
	if ( action.type === ActionType.RESET_SITE_VERTICAL ) {
		return undefined;
	}
	return state;
}

function pageLayouts( state: string[] = [], action: OnboardAction ) {
	if ( action.type === ActionType.TOGGLE_PAGE_LAYOUT ) {
		const layout = action.pageLayout;
		if ( state.includes( layout.slug ) ) {
			return state.filter( item => item !== layout.slug );
		}
		return [ ...state, layout.slug ];
	}
	return state;
}

const reducer = combineReducers( { domain, selectedDesign, siteTitle, siteVertical, pageLayouts } );

export type State = ReturnType< typeof reducer >;

export default reducer;
