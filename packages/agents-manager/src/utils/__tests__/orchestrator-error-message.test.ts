import {
	getOrchestratorErrorClass,
	getOrchestratorErrorCode,
	getOrchestratorErrorMessage,
	getOrchestratorErrorType,
} from '../orchestrator-error-message';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'getOrchestratorErrorMessage', () => {
	it( 'returns null when there is no error', () => {
		expect( getOrchestratorErrorMessage( null ) ).toBeNull();
	} );

	it( 'maps the AI Editorial Review over-limit error code to localized upgrade copy', () => {
		expect( getOrchestratorErrorMessage( 'ai_editorial_review_over_limit' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it( 'maps a differently-worded over-limit message to localized upgrade copy', () => {
		expect( getOrchestratorErrorMessage( 'HTTP 429: Jetpack AI usage limit reached.' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it.each( [
		'ai_editorial_review_over_limit_retryable',
		'prefix_ai_editorial_review_over_limit',
	] )( 'passes the near-miss error code %s through unchanged', ( error ) => {
		expect( getOrchestratorErrorMessage( error ) ).toBe( error );
	} );

	it( 'passes other errors through unchanged', () => {
		expect( getOrchestratorErrorMessage( 'Some other error.' ) ).toBe( 'Some other error.' );
	} );
} );

describe( 'getOrchestratorErrorType', () => {
	it.each( [
		[ 'ai_editorial_review_over_limit', 'usage_limit' ],
		[ 'HTTP 429: Jetpack AI usage limit reached.', 'usage_limit' ],
		[ 'HTTP 429: Too Many Requests', 'rate_limit' ],
		[ 'Rate limit exceeded. Try again later.', 'rate_limit' ],
		[ 'Some other error.', 'other' ],
	] )( 'classifies "%s" as %s', ( error, type ) => {
		expect( getOrchestratorErrorType( error ) ).toBe( type );
	} );

	it.each( [
		'ai_credit_allowance_exhausted',
		'ai_credit_allowance_not_included',
		'ai_credit_allowance_unavailable',
	] )( 'classifies a reply refused with %s as credits, whatever its text', ( code ) => {
		expect( getOrchestratorErrorType( 'Streaming error: Too many requests', code ) ).toBe(
			'credits'
		);
	} );

	it.each( [ undefined, '', 'rest_forbidden', 'xai_credit_allowance_exhausted' ] )(
		'keeps the text-based class for the code %p',
		( code ) => {
			expect( getOrchestratorErrorType( 'HTTP 429: Too Many Requests', code ) ).toBe(
				'rate_limit'
			);
		}
	);
} );

describe( 'getOrchestratorErrorClass', () => {
	it.each( [
		[ 'HTTP error! status: 502', { name: 'AgentRequestError', status: 502 }, '5xx' ],
		[ 'HTTP error! status: 403', { name: 'AgentRequestError', status: 403 }, '4xx' ],
		[ 'HTTP error! status: 429', { name: 'AgentRequestError', status: 429 }, 'rate_limit' ],
		[ 'Request timed out', { name: 'TimeoutError' }, 'timeout' ],
		[ 'The operation was aborted.', { name: 'AbortError' }, 'abort' ],
		[
			'Continue task stream ended without final result',
			{ name: 'StreamIncompleteError' },
			'stream_incomplete',
		],
		[ 'Load failed', { name: 'TypeError' }, 'network' ],
		[ 'Failed to fetch', { name: 'TypeError' }, 'network' ],
		[ 'NetworkError when attempting to fetch resource.', { name: 'TypeError' }, 'network' ],
		[
			'Streaming error: Agent request failed',
			{ name: 'AgentRequestError', code: -32603 },
			'agent_error',
		],
		[ 'Cannot read properties of undefined', { name: 'TypeError' }, 'other' ],
		[ 'Something broke', { name: 'Error' }, 'other' ],
	] )( 'classifies "%s" with %o as %s', ( error, details, errorClass ) => {
		expect( getOrchestratorErrorClass( error, details ) ).toBe( errorClass );
	} );

	it( 'classifies by the status, not a number in the message', () => {
		expect( getOrchestratorErrorClass( 'Order 500 failed', { name: 'Error' } ) ).toBe( 'other' );
	} );

	it( 'keeps the class the error type already finds', () => {
		expect(
			getOrchestratorErrorClass( 'HTTP 429: Jetpack AI usage limit reached.', {
				name: 'AgentRequestError',
				status: 429,
			} )
		).toBe( 'usage_limit' );
		expect(
			getOrchestratorErrorClass(
				'Streaming error: You’ve used all your site credits.',
				{ name: 'AgentRequestError', code: -32000 },
				'ai_credit_allowance_exhausted'
			)
		).toBe( 'credits' );
	} );

	it( 'falls back to other without details', () => {
		expect( getOrchestratorErrorClass( 'Some other error.', null ) ).toBe( 'other' );
	} );
} );

describe( 'getOrchestratorErrorCode', () => {
	it( 'prefers the refusal code to the server’s', () => {
		expect(
			getOrchestratorErrorCode(
				{ name: 'AgentRequestError', code: -32000 },
				'ai_credit_allowance_exhausted'
			)
		).toBe( 'ai_credit_allowance_exhausted' );
	} );

	it.each( [
		[ -32603, '-32603' ],
		[ 'rest_forbidden', 'rest_forbidden' ],
	] )( 'sends the server code %p as %p', ( code, expected ) => {
		expect( getOrchestratorErrorCode( { name: 'AgentRequestError', code } ) ).toBe( expected );
	} );

	it.each( [ 'not an identifier, maybe text', 'x'.repeat( 65 ) ] )(
		'leaves out a code that could be text: %p',
		( code ) => {
			expect( getOrchestratorErrorCode( { name: 'AgentRequestError', code } ) ).toBeUndefined();
		}
	);

	it( 'returns nothing without a code', () => {
		expect( getOrchestratorErrorCode( null ) ).toBeUndefined();
	} );
} );
