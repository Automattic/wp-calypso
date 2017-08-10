/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { chunk, times } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { DEFAULT_PER_PAGE, fetchUsers, normalizeUser, receiveSuccess } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveUser, requestUsers } from 'state/users/actions';

describe( '#normalizeRevision', () => {
	it( 'should rename `id`, `name` and `slug`', () => {
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

	it( 'should not return `undefined` properties', () => {
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
	it( 'should dispatch HTTP request to users endpoint', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );
		const dispatch = sinon.spy();

		fetchUsers( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
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

	it( 'should respect pagination information coming from action', () => {
		const action = requestUsers( 12345678, [ 10 ] );
		action.page = 2;
		action.perPage = 42;
		const dispatch = sinon.spy();

		fetchUsers( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
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
	it( 'should normalize the users and dispatch `receiveUser` for each one', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );
		const dispatch = sinon.spy();

		receiveSuccess( { dispatch }, action, [ { id: 10 }, { id: 11 } ] );

		expect( dispatch ).to.have.been.called.twice;
		expect( dispatch ).to.have.been.calledWith(
			receiveUser( {
				ID: 10,
			} )
		);
		expect( dispatch ).to.have.been.calledWith(
			receiveUser( {
				ID: 11,
			} )
		);
	} );

	it( 'should fetch another page if it receives a full page of users (default per page)', () => {
		const nbUsers = DEFAULT_PER_PAGE + 1;
		const ids = times( nbUsers );
		const users = times( nbUsers, id => ( { id } ) );
		const usersChunks = chunk( users, DEFAULT_PER_PAGE );

		const action = requestUsers( 12345678, ids );
		const dispatch = sinon.spy();

		receiveSuccess(
			{ dispatch },
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
		);

		expect( dispatch ).to.have.been.calledWith(
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

	it( 'should fetch another page if it receives a full page of users (custom per page)', () => {
		const perPage = 4;
		const nbUsers = perPage + 1;
		const ids = times( nbUsers );
		const users = times( nbUsers, id => ( { id } ) );
		const usersChunks = chunk( users, perPage );

		const action = {
			...requestUsers( 12345678, ids ),
			perPage: perPage,
		};
		const dispatch = sinon.spy();

		receiveSuccess(
			{ dispatch },
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
		);

		expect( dispatch ).to.have.been.calledWith(
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
