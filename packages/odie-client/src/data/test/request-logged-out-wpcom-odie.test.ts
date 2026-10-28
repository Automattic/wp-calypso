import { requestLoggedOutWpcomOdie } from '../request-logged-out-wpcom-odie';

describe( 'requestLoggedOutWpcomOdie', () => {
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		globalThis.fetch = jest.fn();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	afterAll( () => {
		if ( originalFetch ) {
			globalThis.fetch = originalFetch;
		} else {
			delete ( globalThis as { fetch?: typeof fetch } ).fetch;
		}
	} );

	it( 'omits credentials when fetching a logged-out chat', async () => {
		const response = { chat_id: 123 };
		const fetchMock = jest.mocked( globalThis.fetch ).mockResolvedValue( {
			json: jest.fn().mockResolvedValue( response ),
			ok: true,
		} as unknown as Response );

		await expect(
			requestLoggedOutWpcomOdie( '/odie/chat/logged-out-bot/123?session_id=session-id' )
		).resolves.toEqual( response );

		expect( fetchMock ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/odie/chat/logged-out-bot/123?session_id=session-id',
			{
				body: undefined,
				credentials: 'omit',
				headers: undefined,
				method: 'GET',
				signal: undefined,
			}
		);
	} );

	it( 'sends messages without credentials', async () => {
		const response = { chat_id: 123 };
		const fetchMock = jest.mocked( globalThis.fetch ).mockResolvedValue( {
			json: jest.fn().mockResolvedValue( response ),
			ok: true,
		} as unknown as Response );

		await requestLoggedOutWpcomOdie( '/odie/chat/logged-out-bot/123', {
			body: {
				message: 'Hello',
				session_id: 'session-id',
			},
			method: 'POST',
		} );

		expect( fetchMock ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/odie/chat/logged-out-bot/123',
			{
				body: JSON.stringify( {
					message: 'Hello',
					session_id: 'session-id',
				} ),
				credentials: 'omit',
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				signal: undefined,
			}
		);
	} );

	describe( 'anon ID', () => {
		const setCookie = ( name: string, value: string ) => {
			document.cookie = `${ name }=${ value }; path=/`;
		};

		afterEach( () => {
			[ 'tk_ai', 'tk_ai_explat' ].forEach( ( name ) => {
				document.cookie = `${ name }=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
			} );
		} );

		const mockFetch = () =>
			jest.mocked( globalThis.fetch ).mockResolvedValue( {
				json: jest.fn().mockResolvedValue( {} ),
				ok: true,
			} as unknown as Response );

		const sentBody = async () => {
			const fetchMock = mockFetch();
			await requestLoggedOutWpcomOdie( '/odie/chat/logged-out-bot', {
				body: { message: 'Hello' },
				method: 'POST',
			} );
			return JSON.parse( fetchMock.mock.calls[ 0 ][ 1 ]?.body as string );
		};

		it( 'sends the ExPlat anon ID with messages so logged-out visitors can join experiments', async () => {
			setCookie( 'tk_ai', 'tracks-anon-id' );
			setCookie( 'tk_ai_explat', 'explat%2Fanon-id' );

			expect( await sentBody() ).toEqual( { message: 'Hello', anon_id: 'explat/anon-id' } );
		} );

		it( 'falls back to the Tracks anon ID', async () => {
			setCookie( 'tk_ai', 'tracks-anon-id' );

			expect( await sentBody() ).toEqual( { message: 'Hello', anon_id: 'tracks-anon-id' } );
		} );

		it( 'leaves GET requests unchanged', async () => {
			setCookie( 'tk_ai_explat', 'explat-anon-id' );
			const fetchMock = mockFetch();

			await requestLoggedOutWpcomOdie( '/odie/chat/logged-out-bot/123' );

			expect( fetchMock.mock.calls[ 0 ][ 0 ] ).toBe(
				'https://public-api.wordpress.com/wpcom/v2/odie/chat/logged-out-bot/123'
			);
		} );
	} );

	it( 'throws the API error message', async () => {
		jest.mocked( globalThis.fetch ).mockResolvedValue( {
			json: jest.fn().mockResolvedValue( { message: 'Unable to load chat.' } ),
			ok: false,
			statusText: 'Forbidden',
		} as unknown as Response );

		await expect( requestLoggedOutWpcomOdie( '/odie/chat/logged-out-bot/123' ) ).rejects.toThrow(
			'Unable to load chat.'
		);
	} );
} );
