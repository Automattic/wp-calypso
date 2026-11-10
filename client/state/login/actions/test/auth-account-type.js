import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING } from 'calypso/state/action-types';
import { receiveSuccess, receiveError } from 'calypso/state/data-layer/wpcom/users/auth-options';
import loginReducer from 'calypso/state/login/reducer';
import { getAuthAccountType } from '../auth-account-type';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEventWithClientId: () => ( { type: 'TEST_TRACKS_EVENT' } ),
} ) );

const createTestStore = () => {
	const requests = [];
	const captureRequests = () => ( next ) => ( action ) => {
		if ( action.type === LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING ) {
			requests.push( action );
		}
		return next( action );
	};
	const store = createStore(
		combineReducers( { login: loginReducer } ),
		applyMiddleware( thunk, captureRequests )
	);
	return { store, requests };
};

describe( 'getAuthAccountType', () => {
	test( 'waits for Blackbox and disables the form before requesting account details', async () => {
		const { store, requests } = createTestStore();
		let finish;
		const blackbox = { getSessionId: () => new Promise( ( resolve ) => ( finish = resolve ) ) };
		const pending = store.dispatch( getAuthAccountType( 'someone@example.com', blackbox ) );

		expect( requests ).toHaveLength( 0 );
		expect( store.getState().login.isFormDisabled ).toBe( true );
		finish( 'session-id' );
		await pending;
		expect( requests ).toEqual( [
			{
				type: LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
				usernameOrEmail: 'someone@example.com',
				blackboxSessionId: 'session-id',
				onComplete: expect.any( Function ),
			},
		] );
	} );

	test( 'continues without a session when Blackbox is unavailable or disabled', async () => {
		const { store, requests } = createTestStore();
		await store.dispatch(
			getAuthAccountType( 'someone', { getSessionId: async () => undefined } )
		);
		expect( requests ).toHaveLength( 1 );
		expect( requests[ 0 ].blackboxSessionId ).toBeUndefined();
		expect( requests[ 0 ].onComplete ).toBeUndefined();
	} );

	test( 'cancels an inactive form and clears its pending state', async () => {
		const { store, requests } = createTestStore();
		await store.dispatch( getAuthAccountType( 'someone', { getSessionId: async () => null } ) );
		expect( requests ).toHaveLength( 0 );
		expect( store.getState().login.isFormDisabled ).toBe( false );
		expect( store.getState().login.isRequesting ).toBe( false );
		expect( store.getState().login.requestError ).toBeNull();
	} );

	test( 'does not start a duplicate lookup while Blackbox is pending', async () => {
		const { store, requests } = createTestStore();
		let finish;
		const blackbox = {
			getSessionId: jest.fn( () => new Promise( ( resolve ) => ( finish = resolve ) ) ),
		};
		const pending = store.dispatch( getAuthAccountType( 'someone', blackbox ) );
		await store.dispatch( getAuthAccountType( 'someone', blackbox ) );
		expect( blackbox.getSessionId ).toHaveBeenCalledTimes( 1 );
		finish( 'session-id' );
		await pending;
		expect( requests ).toHaveLength( 1 );
	} );

	test.each( [ 'success', 'failure' ] )(
		'rotates the session after lookup %s before the next attempt',
		async ( outcome ) => {
			const { store, requests } = createTestStore();
			let sessionId = 'first';
			const blackbox = {
				getSessionId: jest.fn( async () => sessionId ),
				reset: jest.fn( () => {
					sessionId = 'second';
				} ),
			};
			await store.dispatch( getAuthAccountType( 'first-user', blackbox ) );
			expect( blackbox.reset ).not.toHaveBeenCalled();
			const actions =
				outcome === 'success'
					? receiveSuccess( requests[ 0 ], { passwordless: false } )
					: receiveError( requests[ 0 ], { error: 'unknown_user', message: 'Unknown user' } );
			actions.forEach( store.dispatch );
			expect( blackbox.reset ).toHaveBeenCalledWith( 'first' );
			expect( await blackbox.getSessionId() ).toBe( 'second' );
			await store.dispatch( getAuthAccountType( 'second-user', blackbox ) );
			expect( requests.map( ( request ) => request.blackboxSessionId ) ).toEqual( [
				'first',
				'second',
			] );
		}
	);

	test( 'validates an empty identifier without collecting', async () => {
		jest.useFakeTimers();
		try {
			const { store, requests } = createTestStore();
			const blackbox = { getSessionId: jest.fn() };
			await store.dispatch( getAuthAccountType( '', blackbox ) );
			jest.runAllTimers();
			expect( blackbox.getSessionId ).not.toHaveBeenCalled();
			expect( requests ).toHaveLength( 0 );
			expect( store.getState().login.requestError.code ).toBe( 'empty_username' );
			expect( store.getState().login.isFormDisabled ).toBe( false );
		} finally {
			jest.useRealTimers();
		}
	} );
} );
