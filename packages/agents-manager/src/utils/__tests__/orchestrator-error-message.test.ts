import { getOrchestratorErrorMessage } from '../orchestrator-error-message';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'getOrchestratorErrorMessage', () => {
	it( 'returns null when there is no error', () => {
		expect( getOrchestratorErrorMessage( null ) ).toBeNull();
	} );

	it( 'maps the over-limit error code to localized upgrade copy', () => {
		expect( getOrchestratorErrorMessage( 'review_mediator_over_limit' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it( 'maps a differently-worded over-limit message to localized upgrade copy', () => {
		expect( getOrchestratorErrorMessage( 'HTTP 429: Jetpack AI usage limit reached.' ) ).toBe(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.'
		);
	} );

	it( 'passes other errors through unchanged', () => {
		expect( getOrchestratorErrorMessage( 'Some other error.' ) ).toBe( 'Some other error.' );
	} );
} );
