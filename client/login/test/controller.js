import page from '@automattic/calypso-router';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import { redirectJetpack, login, magicLogin } from '../controller';

jest.mock( 'calypso/state/oauth2-clients/actions', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/actions' ),
	fetchOAuth2ClientData: jest.fn(),
} ) );

jest.mock( 'calypso/state/oauth2-clients/selectors', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/selectors' ),
	getOAuth2Client: jest.fn(),
} ) );

jest.mock( 'calypso/lib/oauth2-clients', () => ( {
	...jest.requireActual( 'calypso/lib/oauth2-clients' ),
	isWooOAuth2Client: jest.fn(),
} ) );

jest.mock( 'calypso/state/oauth2-clients/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/ui/selectors' ),
	getCurrentOAuth2Client: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-is-blaze-pro', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/is-woo-jpc-flow', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-router' );

describe( 'redirectJetpack', () => {
	it( "does not append 'jetpack' to the login path and redirect if it's already present", () => {
		const context = {
			path: '/log-in/jetpack',
			params: { isJetpack: 'test string, not important' },
			query: { redirect_to: 'source=jetpack-plans' },
			redirect: ( path ) => {
				throw new Error( `Browser redirected to unexpected path '${ path }'` );
			},
		};
		const next = jest.fn();

		redirectJetpack( context, next );

		// If a redirect didn't occur, the test passes
		expect( next ).toHaveBeenCalled();
	} );
} );

describe( 'login', () => {
	let context;
	let next;
	let state;

	beforeEach( () => {
		state = {
			app: {},
		};

		context = {
			query: {},
			store: {
				getState: jest.fn().mockReturnValue( state ),
				dispatch: jest.fn(),
			},
			params: {
				flow: 'login',
			},
		};
		next = jest.fn();
	} );

	it( 'should replace page and return if context.hash and context.hash.client_id exist', async () => {
		context.hash = { client_id: '1234' };

		await login( context, next );

		expect( page.replace ).toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should throw an error if client_id exists but redirect_to does not', async () => {
		context.query.client_id = '1234';

		await login( context, next );

		expect( next ).toHaveBeenCalledWith( expect.objectContaining( { status: 401 } ) );
	} );

	it( 'should throw an error if client_id does not match redirectClientId', async () => {
		context.query.client_id = '1234';
		context.query.redirect_to = 'http://public-api.wordpress.com?client_id=different_client_id';

		await login( context, next );

		expect( next ).toHaveBeenCalledWith( expect.objectContaining( { status: 401 } ) );
	} );

	it( 'should get OAuth2Client if back parameter is present', async () => {
		context.query.client_id = '1234';
		context.query.redirect_to =
			'http://jetpack.com?back=https://public-api.wordpress.com?client_id=1234';
		getOAuth2Client.mockReturnValueOnce( {} );

		await login( context, next );

		expect( getOAuth2Client ).toHaveBeenCalledWith( state, '1234' );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should get OAuth2Client if client_id matches redirectClientId', async () => {
		context.query.client_id = '1234';
		context.query.redirect_to = 'http://public-api.wordpress.com?client_id=1234';
		getOAuth2Client.mockReturnValueOnce( {} );

		await login( context, next );

		expect( getOAuth2Client ).toHaveBeenCalledWith( state, '1234' );
		expect( next ).toHaveBeenCalled();
	} );
} );

describe( 'magicLogin', () => {
	let context;
	let next;
	let nextArguments;
	let fetchedClientIds;
	let dispatchedActions;

	beforeEach( () => {
		nextArguments = [];
		fetchedClientIds = [];
		dispatchedActions = [];
		context = {
			path: '/log-in/link',
			query: {},
			store: {
				getState: jest.fn().mockReturnValue( { currentUser: { id: null } } ),
				dispatch: ( action ) => {
					dispatchedActions.push( action );
					return action;
				},
			},
		};
		next = ( ...args ) => nextArguments.push( args );
		fetchOAuth2ClientData.mockImplementation( ( clientId ) => {
			fetchedClientIds.push( clientId );
			return { type: 'FETCH_CLIENT', clientId };
		} );
	} );

	it( 'fetches OAuth client metadata before rendering a client magic-login flow', async () => {
		context.query = {
			client_id: '137504',
			redirect_to: 'https://public-api.wordpress.com/oauth2/authorize?client_id=137504',
		};

		await magicLogin( context, next );

		expect( fetchedClientIds ).toEqual( [ '137504' ] );
		expect( dispatchedActions ).toEqual( [ { type: 'FETCH_CLIENT', clientId: '137504' } ] );
		expect( nextArguments ).toEqual( [ [] ] );
	} );

	it( 'rejects a client ID that does not match the OAuth redirect', async () => {
		context.query = {
			client_id: '137504',
			redirect_to: 'https://public-api.wordpress.com/oauth2/authorize?client_id=1854',
		};

		await magicLogin( context, next );

		expect( fetchedClientIds ).toEqual( [] );
		expect( nextArguments[ 0 ][ 0 ].status ).toBe( 401 );
	} );

	it( 'does not derive a branded flow from query flags without a client ID', async () => {
		context.query = { spacefast_flow: '1' };

		await magicLogin( context, next );

		expect( fetchedClientIds ).toEqual( [] );
		expect( nextArguments ).toEqual( [ [] ] );
	} );
} );
