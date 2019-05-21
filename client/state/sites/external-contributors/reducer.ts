/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST_FAILURE,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Types
 */
import { SiteId, UserId } from 'types';
import { ExternalContributor } from './types';

interface ModifyAction {
	userId: UserId;
	siteId: SiteId;
}

const requestingReducer = createReducer( false, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => true,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: () => false,
} );

export const requestErrorReducer = createReducer( false, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: ( _state: any, { error: { message } } ) =>
		message || true,
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST_FAILURE ]: ( _state: any, { error: { message } } ) =>
		message || true,
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_SUCCESS ]: () => false,
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_FAILURE ]: ( _state: any, { error: { message } } ) =>
		message || true,
} );

const removeExternalContributorFromItems = (
	items: ExternalContributor,
	{ userId }: ModifyAction
) => {
	return items.filter( item => item !== userId );
};

const addExternalContributorToItems = ( items: ExternalContributor, { userId }: ModifyAction ) => {
	return [ ...items, userId ];
};

const itemsReducer = createReducer( null, {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: () => null,
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS ]: (
		_items: ExternalContributor,
		{ contributors }
	) => contributors || [],
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE ]: () => null,
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST ]: addExternalContributorToItems,
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST_FAILURE ]: removeExternalContributorFromItems,
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST ]: removeExternalContributorFromItems,
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_FAILURE ]: addExternalContributorToItems,
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		items: itemsReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);
