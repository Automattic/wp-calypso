import page from '@automattic/calypso-router';
import { fetchOAuth2_1ClientData } from 'calypso/state/oauth2-clients/actions';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import { redirectJetpack, login } from '../controller';

jest.mock( 'calypso/state/oauth2-clients/actions', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/actions' ),
	fetchOAuth2ClientData: jest.fn(),
	fetchOAuth2_1ClientData: jest.fn(),
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

	describe( 'oauth2_1_client_id', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should throw an error if oauth2_1_client_id exists but redirect_to does not', async () => {
			context.query.oauth2_1_client_id = '7';

			await login( context, next );

			expect( next ).toHaveBeenCalledWith( expect.objectContaining( { status: 401 } ) );
		} );

		it( 'should throw an error if oauth2_1_client_id does not match the client_id in redirect_to', async () => {
			context.query.oauth2_1_client_id = '7';
			context.query.redirect_to =
				'https://public-api.wordpress.com/oauth2-1/authorize/?client_id=8';

			await login( context, next );

			expect( next ).toHaveBeenCalledWith( expect.objectContaining( { status: 401 } ) );
		} );

		it( 'should fetch the OAuth 2.1 client data when the id matches redirect_to', async () => {
			context.query.oauth2_1_client_id = '7';
			context.query.redirect_to =
				'https://public-api.wordpress.com/oauth2-1/authorize/?client_id=7';
			getOAuth2Client.mockReturnValueOnce( null );

			await login( context, next );

			expect( getOAuth2Client ).toHaveBeenCalledWith( state, 'oauth2-1:7' );
			expect( fetchOAuth2_1ClientData ).toHaveBeenCalledWith( '7' );
			expect( next ).toHaveBeenCalledWith();
		} );

		it( 'should not fetch when the OAuth 2.1 client data is already in the store', async () => {
			context.query.oauth2_1_client_id = '7';
			context.query.redirect_to =
				'https://public-api.wordpress.com/oauth2-1/authorize/?client_id=7';
			getOAuth2Client.mockReturnValueOnce( { id: 'oauth2-1:7', title: 'ChatGPT' } );

			await login( context, next );

			expect( fetchOAuth2_1ClientData ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalledWith();
		} );

		it( 'should continue unbranded when the OAuth 2.1 client data fetch fails', async () => {
			context.query.oauth2_1_client_id = '7';
			context.query.redirect_to =
				'https://public-api.wordpress.com/oauth2-1/authorize/?client_id=7';
			getOAuth2Client.mockReturnValueOnce( null );
			context.store.dispatch.mockImplementationOnce( ( thunk ) => thunk );
			fetchOAuth2_1ClientData.mockImplementationOnce( () =>
				Promise.reject( new Error( 'not found' ) )
			);

			await login( context, next );

			expect( next ).toHaveBeenCalledWith();
		} );
	} );
} );
