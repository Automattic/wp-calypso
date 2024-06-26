import page from '@automattic/calypso-router';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import { redirectJetpack, login } from '../controller';

jest.mock( 'calypso/state/oauth2-clients/actions', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/actions' ),
	fetchOAuth2ClientData: jest.fn(),
} ) );

jest.mock( 'calypso/state/oauth2-clients/selectors', () => ( {
	...jest.requireActual( 'calypso/state/oauth2-clients/selectors' ),
	getOAuth2Client: jest.fn(),
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
