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

const siteWasCreatedForDomainPurchase: Reducer< boolean, OnboardAction > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'SET_SITE_WAS_CREATED_FOR_DOMAIN_PURCHASE':
			return action.siteWasCreatedForDomainPurchase;

		case 'RESET_ONBOARD_STORE':
			return false;

		default:
			return state;
	}
};

const reducer = combineReducers( {
	domain,
	selectedDesign,
	siteTitle,
	siteVertical,
	pageLayouts,
	siteWasCreatedForDomainPurchase,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
