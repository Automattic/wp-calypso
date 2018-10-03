/** @format */

/**
 * External dependencies
 */
import { chunk, times } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_PER_PAGE, fetchUsers, normalizeUser, receiveSuccess } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveUser, requestUsers } from 'state/users/actions';

describe( '#normalizeRevision', () => {
	test( 'should rename `id`, `name` and `slug`', () => {
		expect(
			normalizeUser( {
				id: 10,
				name: 'Alice Bob',
				slug: 'alicebob',
			} )
		).to.eql( {
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
		).to.eql( {
			ID: 10,
		} );
	} );
} );

describe( '#fetchUsers', () => {
	test( 'should dispatch HTTP request to users endpoint', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );

		expect( fetchUsers( action ) ).toEqual(
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
		const action = requestUsers( 12345678, [ 10 ] );
		action.page = 2;
		action.perPage = 42;

		expect( fetchUsers( action ) ).toEqual(
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
	test( 'should normalize the users and dispatch `receiveUser` for each one', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );

		expect( receiveSuccess( action, [ { id: 10 }, { id: 11 } ] ) ).toEqual( [
			receiveUser( {
				ID: 10,
			} ),
			receiveUser( {
				ID: 11,
			} ),
		] );
	} );

	test( 'should fetch another page if it receives a full page of users (default per page)', () => {
		const nbUsers = DEFAULT_PER_PAGE + 1;
		const ids = times( nbUsers );
		const users = times( nbUsers, id => ( { id } ) );
		const usersChunks = chunk( users, DEFAULT_PER_PAGE );

		const action = requestUsers( 12345678, ids );

		expect(
			receiveSuccess(
				{
					...action,
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
			)
		).toEqual(
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
					...action,
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
		const users = times( nbUsers, id => ( { id } ) );
		const usersChunks = chunk( users, perPage );

		const action = {
			...requestUsers( 12345678, ids ),
			perPage: perPage,
		};

		expect(
			receiveSuccess(
				{
					...action,
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
			)
		).toEqual(
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
					...action,
					page: 2,
					perPage: perPage,
				}
			)
		);
	} );
} );
