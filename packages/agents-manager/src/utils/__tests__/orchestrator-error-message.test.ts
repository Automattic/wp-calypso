import {
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
