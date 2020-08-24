/**
 * Internal dependencies
 */
import getRequest from '../get-request';
import { getRequestKey } from 'state/data-layer/wpcom-http/utils';

test( 'should return default state even before initialization', () => {
	const state = { dataRequests: {} };

	expect( getRequest( state, { type: 'DUMMY_REQUEST' } ) ).toEqual( {
		hasLoaded: false,
		isLoading: false,
	} );
} );

test( 'should indicate no data initialization when no `lastUpdated` exists', () => {
	const action = { type: 'DUMMY_REQUEST' };
	const requestKey = getRequestKey( action );
	const state = { dataRequests: { [ requestKey ]: {} } };

	expect( getRequest( state, action ) ).toHaveProperty( 'hasLoaded', false );
} );

test( 'should indicate data initialization when `lastUpdated` exists', () => {
	const action = { type: 'DUMMY_REQUEST' };
	const requestKey = getRequestKey( action );
	const state = { dataRequests: { [ requestKey ]: { lastUpdated: 1518 } } };

	expect( getRequest( state, action ) ).toHaveProperty( 'hasLoaded', true );
} );

test( 'should indicate loading when status is pending', () => {
	const action = { type: 'DUMMY_REQUEST' };
	const requestKey = getRequestKey( action );
	const state = { dataRequests: { [ requestKey ]: { status: 'pending' } } };

	expect( getRequest( state, action ) ).toHaveProperty( 'isLoading', true );
} );

test( "should indicate not loading if status isn't pending", () => {
	const action = { type: 'DUMMY_REQUEST' };
	const requestKey = getRequestKey( action );
	const state = ( status ) => ( { dataRequests: { [ requestKey ]: { status } } } );

	[ 'success', 'failure', undefined, null ].forEach( ( status ) =>
		expect( getRequest( state( status ), action ) ).toHaveProperty( 'isLoading', false )
	);
} );

test( 'should not hide any stored properties in state', () => {
	const action = { type: 'DUMMY_REQUEST' };
	const requestKey = getRequestKey( action );
	const state = {
		dataRequests: { [ requestKey ]: { pendingSince: 1500, status: 'success', lastUpdated: 2000 } },
	};

	expect( getRequest( state, action ) ).toEqual( {
		hasLoaded: true,
		isLoading: false,
		lastUpdated: 2000,
		pendingSince: 1500,
		status: 'success',
	} );
} );
