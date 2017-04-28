/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchUsers,
	normalizeUser,
	receiveSuccess,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receiveUser,
	requestUsers,
} from 'state/users/actions';

describe( '#normalizeRevision', () => {
	it( 'should rename `id`, `name` and `slug`', () => {
		expect( normalizeUser( {
			id: 10,
			name: 'Alice Bob',
			slug: 'alicebob',
		} ) ).to.eql( {
			ID: 10,
			display_name: 'Alice Bob',
			username: 'alicebob',
		} );
	} );

	it( 'should not return `undefined` properties', () => {
		expect( normalizeUser( {
			id: 10
		} ) ).to.eql( {
			ID: 10,
		} );
	} );
} );

describe( '#fetchUsers', () => {
	it( 'should dispatch HTTP request to users endpoint', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );
		const dispatch = sinon.spy();
		const next = sinon.spy();

		fetchUsers( { dispatch }, action, next );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/sites/12345678/users',
			query: {
				apiNamespace: 'wp/v2',
				include: [ 10, 11 ],
			},
		}, action ) );
	} );
} );

describe( '#receiveSuccess', () => {
	it( 'should normalize the users and dispatch `receiveUser` for each one', () => {
		const action = requestUsers( 12345678, [ 10, 11 ] );
		const dispatch = sinon.spy();
		const next = sinon.spy();

		receiveSuccess( { dispatch }, action, next, [
			{
				id: 10,
			},
			{
				id: 11,
			},
		] );

		expect( dispatch ).to.have.been.called.twice;
		expect( dispatch ).to.have.been.calledWith( receiveUser( {
			ID: 10,
		} ) );
		expect( dispatch ).to.have.been.calledWith( receiveUser( {
			ID: 11,
		} ) );
	} );
} );
