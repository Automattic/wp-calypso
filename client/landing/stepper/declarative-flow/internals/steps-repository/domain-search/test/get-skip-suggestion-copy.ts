import { getSkipSuggestionCopy } from '../get-skip-suggestion-copy';

const identity = ( text: string ) => text;

describe( 'getSkipSuggestionCopy', () => {
	it( 'drops the "start free" framing for the AI Website Builder onboarding flow', () => {
		expect( getSkipSuggestionCopy( 'ai-site-builder-onboarding', identity ) ).toEqual( {
			title: 'Start with %(domain)s',
			buttonText: 'Choose a domain later',
		} );
	} );

	it( 'keeps the default copy for flows that can start free', () => {
		expect( getSkipSuggestionCopy( 'onboarding', identity ) ).toBeUndefined();
		expect( getSkipSuggestionCopy( null, identity ) ).toBeUndefined();
	} );

	it( 'applies per-flow title/button overrides on a flow that has no default copy', () => {
		expect(
			getSkipSuggestionCopy( 'onboarding', identity, {
				title: 'Grab %(domain)s for free',
				buttonText: 'Use a free address',
			} )
		).toEqual( {
			title: 'Grab %(domain)s for free',
			buttonText: 'Use a free address',
		} );
	} );

	it( 'applies a partial override, leaving the other value undefined', () => {
		expect(
			getSkipSuggestionCopy( 'onboarding', identity, { title: 'Grab %(domain)s for free' } )
		).toEqual( {
			title: 'Grab %(domain)s for free',
			buttonText: undefined,
		} );
	} );

	it( 'lets an override win over the flow default', () => {
		expect(
			getSkipSuggestionCopy( 'ai-site-builder-onboarding', identity, {
				buttonText: 'Skip for now',
			} )
		).toEqual( {
			title: 'Start with %(domain)s',
			buttonText: 'Skip for now',
		} );
	} );
} );
