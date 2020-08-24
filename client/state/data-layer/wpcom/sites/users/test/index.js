/**
 * External dependencies
 */
import { chunk, times } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DEFAULT_PER_PAGE,
	fetchPostRevisionAuthors,
	normalizeUser,
	receivePostRevisionAuthorsSuccess,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisionAuthors,
	requestPostRevisionAuthors,
} from 'state/posts/revisions/authors/actions';
import { POST_REVISION_AUTHORS_RECEIVE } from 'state/action-types';

describe( '#normalizeRevision', () => {
	test( 'should rename `id`, `name` and `slug`', () => {
		expect(
			normalizeUser( {
				id: 10,
				name: 'Alice Bob',
				slug: 'alicebob',
			} )
		).toEqual( {
			ID: 10,
			display_name: 'Alice Bob',
			username: 'alicebob',
		} );
	} );

	test( 'should not return `undefined` properties', () => {
		expect(
			normalizeUser( {
				id: 10,
			} )
		).toEqual( {
			ID: 10,
		} );
	} );
} );

describe( '#fetchPostRevisionAuthors', () => {
	test( 'should dispatch HTTP request to users endpoint', () => {
		const action = requestPostRevisionAuthors( 12345678, [ 10, 11 ] );

		expect( fetchPostRevisionAuthors( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: '/sites/12345678/users',
					apiNamespace: 'wp/v2',
					query: {
						include: [ 10, 11 ],
						page: 1,
						per_page: 10,
					},
				},
				action
			)
		);
	} );

	test( 'should respect pagination information coming from action', () => {
		const action = requestPostRevisionAuthors( 12345678, [ 10 ] );
		action.page = 2;
		action.perPage = 42;

		expect( fetchPostRevisionAuthors( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: '/sites/12345678/users',
					apiNamespace: 'wp/v2',
					query: {
						include: [ 10 ],
						page: 2,
						per_page: 42,
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveSuccess', () => {
	test( 'should normalize the users and dispatch `receiveUsers` with their list', () => {
		const requestAction = requestPostRevisionAuthors( 12345678, [ 10, 11 ] );
		const successAction = receivePostRevisionAuthorsSuccess( requestAction, [
			{ id: 10 },
			{ id: 11 },
		] );

		const dispatch = jest.fn();
		successAction( dispatch );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			receivePostRevisionAuthors( [ { ID: 10 }, { ID: 11 } ] )
		);
	} );

	test( 'should fetch another page if it receives a full page of users (default per page)', () => {
		const nbUsers = DEFAULT_PER_PAGE + 1;
		const ids = times( nbUsers );
		const users = times( nbUsers, ( id ) => ( { id } ) );
		const usersChunks = chunk( users, DEFAULT_PER_PAGE );

		const requestAction = requestPostRevisionAuthors( 12345678, ids );
		const successAction = receivePostRevisionAuthorsSuccess(
			{
				...requestAction,
				meta: {
					dataLayer: {
						headers: {
							'X-WP-Total': nbUsers,
							'X-WP-TotalPages': Math.ceil( nbUsers / DEFAULT_PER_PAGE ),
						},
					},
				},
			},
			usersChunks[ 0 ]
		);

		const dispatch = jest.fn();
		successAction( dispatch );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( { type: POST_REVISION_AUTHORS_RECEIVE } )
		);
		expect( dispatch ).toHaveBeenNthCalledWith(
			2,
			http(
				{
					method: 'GET',
					path: '/sites/12345678/users',
					apiNamespace: 'wp/v2',
					query: {
						include: ids,
						page: 2,
						per_page: DEFAULT_PER_PAGE,
					},
				},
				{
					...requestAction,
					page: 2,
					perPage: DEFAULT_PER_PAGE,
				}
			)
		);
	} );

	test( 'should fetch another page if it receives a full page of users (custom per page)', () => {
		const perPage = 4;
		const nbUsers = perPage + 1;
		const ids = times( nbUsers );
		const users = times( nbUsers, ( id ) => ( { id } ) );
		const usersChunks = chunk( users, perPage );

		const requestAction = { ...requestPostRevisionAuthors( 12345678, ids ), perPage };
		const successAction = receivePostRevisionAuthorsSuccess(
			{
				...requestAction,
				meta: {
					dataLayer: {
						headers: {
							'X-WP-Total': nbUsers,
							'X-WP-TotalPages': Math.ceil( nbUsers / perPage ),
						},
					},
				},
			},
			usersChunks[ 0 ]
		);

		const dispatch = jest.fn();
		successAction( dispatch );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( { type: POST_REVISION_AUTHORS_RECEIVE } )
		);
		expect( dispatch ).toHaveBeenNthCalledWith(
			2,
			http(
				{
					method: 'GET',
					path: '/sites/12345678/users',
					apiNamespace: 'wp/v2',
					query: {
						include: ids,
						page: 2,
						per_page: perPage,
					},
				},
				{
					...requestAction,
					page: 2,
					perPage,
				}
			)
		);
	} );
} );
