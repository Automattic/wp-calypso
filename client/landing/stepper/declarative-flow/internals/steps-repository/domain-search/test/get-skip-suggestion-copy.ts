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
} );
