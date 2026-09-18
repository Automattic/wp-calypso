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
