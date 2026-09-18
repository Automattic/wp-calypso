import { getReaderChatErrorMessage } from '../reader-chat-error-message';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'getReaderChatErrorMessage', () => {
	it( 'returns null when there is no error', () => {
		expect( getReaderChatErrorMessage( null ) ).toBeNull();
	} );

	it( 'maps Search usage errors to stable Site Chat copy', () => {
		expect( getReaderChatErrorMessage( { code: 'reader_chat_search_ai_over_limit' } ) ).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'maps production Search usage message strings to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage(
				'Reader Chat is temporarily unavailable because this site has reached its Jetpack Search AI usage limit.'
			)
		).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'maps new production Search usage message strings to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage(
				'Site Chat is temporarily unavailable because this site has reached its Jetpack Search AI usage limit.'
			)
		).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'maps wrapped Search usage Error messages to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage(
				new Error(
					'HTTP 403: Reader Chat is temporarily unavailable because this site has reached its Jetpack Search AI usage limit.'
				)
			)
		).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'maps JSON-encoded Search usage error codes to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage( new Error( '{"code":"reader_chat_search_over_limit"}' ) )
		).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'maps unavailable target errors to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage( { data: { code: 'reader_chat_search_not_supported' } } )
		).toBe( 'Site Chat is not available for this site.' );
	} );

	it( 'maps JSON-encoded unavailable error codes to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage( new Error( '{"code":"reader_chat_search_not_supported"}' ) )
		).toBe( 'Site Chat is not available for this site.' );
	} );

	it( 'maps old production unavailable message strings to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage(
				'Reader Chat is not available because Jetpack Search is not available for this site.'
			)
		).toBe( 'Site Chat is not available for this site.' );
	} );

	it( 'maps new production unavailable message strings to stable Site Chat copy', () => {
		expect(
			getReaderChatErrorMessage(
				'Site Chat is not available because Jetpack Search is not available for this site.'
			)
		).toBe( 'Site Chat is not available for this site.' );
	} );

	it( 'maps rate limit errors by status', () => {
		expect( getReaderChatErrorMessage( { status: 429 } ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps rate limit errors by string status', () => {
		expect( getReaderChatErrorMessage( { status: '429' } ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps rate limit errors by response status', () => {
		expect( getReaderChatErrorMessage( { response: { status: '429' } } ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps rate limit errors by status code', () => {
		expect( getReaderChatErrorMessage( { statusCode: 429 } ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps rate limit errors by code', () => {
		expect( getReaderChatErrorMessage( { code: 'request_limit_exceeded' } ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps production rate limit message strings', () => {
		expect( getReaderChatErrorMessage( 'Too many requests. Please try again later.' ) ).toBe(
			'Too many requests. Please try again later.'
		);
	} );

	it( 'maps wrapped rate limit Error messages', () => {
		expect(
			getReaderChatErrorMessage(
				new Error( 'HTTP 429: Too many requests. Please try again later.' )
			)
		).toBe( 'Too many requests. Please try again later.' );
	} );

	it( 'uses generic copy for unknown string errors', () => {
		expect( getReaderChatErrorMessage( 'Unexpected failure' ) ).toBe(
			'Site Chat is unavailable. Please try again later.'
		);
	} );

	it( 'reads nested agentic error codes', () => {
		expect( getReaderChatErrorMessage( { error: { code: 'jetpack_ai_usage' } } ) ).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );

	it( 'reads nested agentic error messages', () => {
		expect(
			getReaderChatErrorMessage( {
				error: {
					message:
						'Reader Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.',
				},
			} )
		).toBe(
			'Site Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.'
		);
	} );
} );
