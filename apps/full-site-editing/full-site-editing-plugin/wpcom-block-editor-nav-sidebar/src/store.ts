/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { apiFetch, controls } from '@wordpress/data-controls';
import { combineReducers, registerStore } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import type { Reducer } from 'redux';
import type { DispatchFromMap, SelectFromMap } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { actions, Action } from './actions';
import { STORE_KEY } from './constants';

export interface Page {
	id: number;
	slug: string;
	status: string;
	title: string;
}

const opened: Reducer< boolean, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'TOGGLE_SIDEBAR':
			return ! state;

		default:
			return state;
	}
};

const pages: Reducer< Page[], Action > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'RECEIVE_PAGE_LIST':
			return action.response.map( ( { id, slug, status, title } ) => ( {
				id,
				slug,
				status,
				title: title.rendered,
			} ) );

		default:
			return state;
	}
};

const reducer = combineReducers( { opened, pages } );

type State = ReturnType< typeof reducer >;

const resolvers = {
	getPages: function* () {
		try {
			const response = yield apiFetch( {
				path: addQueryArgs( '/wp/v2/pages', {
					_fields: 'id,slug,status,title',
				} ),
			} );

			yield actions.receivePageList( response );
		} catch ( error ) {
			yield actions.receivePageListFailed( error );
		}
	},
};

const selectors = {
	getPages: ( state: State ) => state.pages,
	isSidebarOpened: ( state: State ) => state.opened,
};

registerStore( STORE_KEY, {
	actions,
	controls,
	reducer: reducer as any,
	resolvers,
	selectors,
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
