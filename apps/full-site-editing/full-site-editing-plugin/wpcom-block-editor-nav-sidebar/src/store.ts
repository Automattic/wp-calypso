/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { apiFetch, controls, select as triggerSelect } from '@wordpress/data-controls';
import { combineReducers, registerStore } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import type { Reducer } from 'redux';
import type { DispatchFromMap, SelectFromMap } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { actions, Action } from './actions';
import { STORE_KEY } from './constants';

export interface Post {
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

const pages: Reducer< Post[], Action > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'RECEIVE_POST_LIST':
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
	getNavItems: function* () {
		const currentPostType = yield triggerSelect( 'core/editor', 'getCurrentPostType' );
		const postType = yield triggerSelect( 'core', 'getPostType', currentPostType );

		const path = `/wp/v2/${ postType.rest_base }`;

		try {
			const response = yield apiFetch( {
				path: addQueryArgs( path, {
					_fields: 'id,slug,status,title',
				} ),
			} );

			yield actions.receivePostList( response );
		} catch ( error ) {
			yield actions.receivePostListFailed( error );
		}
	},
};

const selectors = {
	getNavItems: ( state: State ) => state.pages,
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
