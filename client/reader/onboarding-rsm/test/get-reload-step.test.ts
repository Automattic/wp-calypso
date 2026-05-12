import { getReloadStep } from '../get-reload-step';

describe( 'getReloadStep', () => {
	it( 'returns null when the search string is empty', () => {
		expect( getReloadStep( '' ) ).toBeNull();
	} );

	it( 'returns null when no recognised reload param is present', () => {
		expect( getReloadStep( '?flags=reader%2Fonboarding-rsm' ) ).toBeNull();
	} );

	it( 'maps reloadSubscriptionOnboarding to the "discover" step', () => {
		const result = getReloadStep( '?reloadSubscriptionOnboarding=true' );
		expect( result?.step ).toBe( 'discover' );
	} );

	it( 'maps reloadInterestsOnboarding to the "interests" step', () => {
		const result = getReloadStep( '?reloadInterestsOnboarding=true' );
		expect( result?.step ).toBe( 'interests' );
	} );

	it( 'removes the reload param from the cleaned search string', () => {
		const result = getReloadStep( '?reloadSubscriptionOnboarding=true' );
		expect( result?.cleanedSearch ).toBe( '' );
	} );

	it( 'preserves other query params in the cleaned search string', () => {
		const result = getReloadStep(
			'?flags=reader%2Fonboarding-rsm&reloadSubscriptionOnboarding=true'
		);
		expect( result?.cleanedSearch ).toContain( 'flags=' );
		expect( result?.cleanedSearch ).not.toContain( 'reloadSubscriptionOnboarding' );
	} );

	it( 'preserves other query params when removing the interests reload param', () => {
		const result = getReloadStep(
			'?flags=reader%2Fforce-onboarding&reloadInterestsOnboarding=true'
		);
		expect( result?.step ).toBe( 'interests' );
		expect( result?.cleanedSearch ).toContain( 'flags=' );
		expect( result?.cleanedSearch ).not.toContain( 'reloadInterestsOnboarding' );
	} );

	it( 'returns null for an unrelated param that happens to have "reload" in its name', () => {
		expect( getReloadStep( '?reloadSomethingElse=true' ) ).toBeNull();
	} );
} );
