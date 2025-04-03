import { getFlowFromURL } from '../get-flow-from-url';

describe( 'getFlowFromUrl', () => {
	test( 'extracts flow name from basic stepper URL', () => {
		expect( getFlowFromURL( '/setup/flow-name/step-name' ) ).toBe( 'flow-name' );
	} );

	test( 'extracts flow name from `flow` query param', () => {
		expect( getFlowFromURL( '/a-non-standard-url', '?flow=flow-name' ) ).toBe( 'flow-name' );
	} );

	test( 'extracts flow name from stepper URL with language suffix', () => {
		expect( getFlowFromURL( '/setup/flow-name/step-name/de' ) ).toBe( 'flow-name' );
	} );

	test( 'extracts flow name from stepper URL with missing step name', () => {
		expect( getFlowFromURL( '/setup/flow-name' ) ).toBe( 'flow-name' );
	} );
} );
