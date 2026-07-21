import { getOrchestratorErrorMessage } from '../orchestrator-error-message';

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

	it( 'keeps mapping the legacy over-limit error code for delayed responses', () => {
		expect( getOrchestratorErrorMessage( 'review_mediator_over_limit' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it( 'maps a differently-worded over-limit message to localized upgrade copy', () => {
		expect( getOrchestratorErrorMessage( 'HTTP 429: Jetpack AI usage limit reached.' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it.each( [ 'ai_editorial_review_over_limit_retryable', 'prefix_review_mediator_over_limit' ] )(
		'passes the near-miss error code %s through unchanged',
		( error ) => {
			expect( getOrchestratorErrorMessage( error ) ).toBe( error );
		}
	);

	it( 'passes other errors through unchanged', () => {
		expect( getOrchestratorErrorMessage( 'Some other error.' ) ).toBe( 'Some other error.' );
	} );
} );
