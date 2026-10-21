import { getSkipSuggestionCopy } from '../get-skip-suggestion-copy';

const identity = ( text: string ) => text;

describe( 'getSkipSuggestionCopy', () => {
	it.each( [ 'onboarding', 'ai-site-builder-onboarding' ] )(
		'frames the card as skipping the domain for the %s flow',
		( flow ) => {
			expect( getSkipSuggestionCopy( flow, identity ) ).toEqual( {
				title: 'Skip the domain for now',
				subtitle:
					'You’ll get a WordPress.com branded domain. Upgrade to a custom domain name anytime.',
				buttonText: 'Skip',
				skipLabel: 'Skip the domain for now',
			} );
		}
	);

	it( 'keeps the default copy for flows without their own copy', () => {
		expect( getSkipSuggestionCopy( 'domain', identity ) ).toBeUndefined();
		expect( getSkipSuggestionCopy( null, identity ) ).toBeUndefined();
	} );

	it( 'applies per-flow title/button overrides on a flow that has no default copy', () => {
		expect(
			getSkipSuggestionCopy( 'domain', identity, {
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
			getSkipSuggestionCopy( 'domain', identity, { title: 'Grab %(domain)s for free' } )
		).toEqual( {
			title: 'Grab %(domain)s for free',
			buttonText: undefined,
		} );
	} );

	it( 'passes subtitle and skip label overrides through', () => {
		expect(
			getSkipSuggestionCopy( 'domain', identity, {
				subtitle: 'Upgrade anytime.',
				skipLabel: 'Skip the domain',
			} )
		).toEqual( {
			title: undefined,
			subtitle: 'Upgrade anytime.',
			buttonText: undefined,
			skipLabel: 'Skip the domain',
		} );
	} );

	it( 'lets an override win over the flow default', () => {
		expect(
			getSkipSuggestionCopy( 'ai-site-builder-onboarding', identity, {
				buttonText: 'Skip for now',
			} )
		).toEqual( {
			title: 'Skip the domain for now',
			subtitle:
				'You’ll get a WordPress.com branded domain. Upgrade to a custom domain name anytime.',
			buttonText: 'Skip for now',
			skipLabel: 'Skip the domain for now',
		} );
	} );
} );
