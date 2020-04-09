/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SiteVertical, Design } from './types';
import { OnboardAction } from './actions';
import { FontPair } from 'landing/gutenboarding/constants';

const domain: Reducer<
	import('@automattic/data-stores').DomainSuggestions.DomainSuggestion | undefined,
	OnboardAction
> = ( state, action ) => {
	if ( action.type === 'SET_DOMAIN' ) {
		return action.domain;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const domainSearch: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_DOMAIN_SEARCH_TERM' ) {
		return action.domainSearch;
	}
	if ( action.type === 'SET_SITE_TITLE' ) {
		return action.siteTitle;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const selectedDesign: Reducer< Design | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SELECTED_DESIGN' ) {
		return action.selectedDesign;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const siteTitle: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_SITE_TITLE' ) {
		return action.siteTitle;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const siteVertical: Reducer< SiteVertical | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SITE_VERTICAL' ) {
		return action.siteVertical;
	}
	if ( action.type === 'RESET_SITE_VERTICAL' || action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const pageLayouts: Reducer< string[], OnboardAction > = ( state = [], action ) => {
	if ( action.type === 'TOGGLE_PAGE_LAYOUT' ) {
		const layout = action.pageLayout;
		if ( state.includes( layout.slug ) ) {
			return state.filter( item => item !== layout.slug );
		}
		return [ ...state, layout.slug ];
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return [];
	}
	return state;
};

const selectedSite: Reducer< number | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_SELECTED_SITE' ) {
		return action.selectedSite;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const selectedFonts: Reducer< FontPair | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_FONTS' ) {
		return action.fonts;
	}
	if ( action.type === 'RESET_FONTS' || action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const reducer = combineReducers( {
	domain,
	domainSearch,
	selectedFonts,
	selectedDesign,
	siteTitle,
	siteVertical,
	pageLayouts,
	selectedSite,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
