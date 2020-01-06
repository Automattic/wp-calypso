/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, SiteVertical, TemporaryAccount, TemporaryBlog } from './types';
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

const temporaryBlog: Reducer<
    TemporaryBlog | undefined,
    ReturnType< typeof Actions[ 'setTemporaryBlog' ] >
> = ( state = undefined, action ) => {
    if ( action.type === ActionType.SET_TEMPORARY_BLOG ) {
        console.log( 'action', action );
        return action.temporaryBlog;
    }
    return state;
};

const temporaryAccount: Reducer<
    TemporaryAccount | undefined,
    ReturnType< typeof Actions[ 'setTemporaryAccount' ] >
    > = ( state = undefined, action ) => {
    if ( action.type === ActionType.SET_TEMPORARY_ACCOUNT ) {
        console.log( 'action', action );
        return action.temporaryAccount;
    }
    return state;
};

const reducer = combineReducers( { domain, siteTitle, siteVertical, temporaryAccount, temporaryBlog } );

export type State = ReturnType< typeof reducer >;

export default reducer;
