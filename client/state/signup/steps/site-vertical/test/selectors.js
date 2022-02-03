import {
	getSiteVerticalId,
	getSiteVerticalName,
	getSiteVerticalSlug,
	getSiteVerticalIsUserInput,
	getSiteVerticalParentId,
	getVerticalForDomainSuggestions,
} from '../selectors';

describe( 'selectors', () => {
	const verticals = {
		business: {
			felice: [
				{
					verticalName: 'felice',
					verticalSlug: 'felice',
				},
			],
			contento: [
				{
					verticalName: 'contento',
					verticalSlug: 'contento',
				},
			],
		},
	};

	const state = {
		signup: {
			steps: {
				siteType: 'business',
				siteVertical: {
					id: 'p4u',
					name: 'felice',
					slug: 'happy',
					isUserInput: false,
					parentId: 'gluecklich',
				},
				survey: {
					vertical: 'test-survey',
					otherText: 'test-other-text',
					siteType: 'test-site-type',
				},
			},
			verticals,
		},
	};

	describe( 'getSiteVerticalName', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalName( {} ) ).toEqual( '' );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalName( state ) ).toEqual( state.signup.steps.siteVertical.name );
		} );
	} );
	describe( 'getSiteVerticalSlug', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalSlug( {} ) ).toEqual( '' );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalSlug( state ) ).toEqual( state.signup.steps.siteVertical.slug );
		} );
	} );
	describe( 'getSiteVerticalIsUserInput', () => {
		test( 'should return true as a default state', () => {
			expect( getSiteVerticalIsUserInput( {} ) ).toBe( true );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalIsUserInput( state ) ).toEqual(
				state.signup.steps.siteVertical.isUserInput
			);
		} );
	} );
	describe( 'getSiteVerticalId', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalId( {} ) ).toBe( '' );
		} );

		test( 'should return site id from the state', () => {
			expect( getSiteVerticalId( state ) ).toEqual( state.signup.steps.siteVertical.id );
		} );
	} );
	describe( 'getSiteVerticalParentId', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalParentId( {} ) ).toBe( '' );
		} );

		test( 'should return site id from the state', () => {
			expect( getSiteVerticalParentId( state ) ).toEqual(
				state.signup.steps.siteVertical.parentId
			);
		} );
	} );
	describe( 'getVerticalForDomainSuggestions', () => {
		test( 'should return empty string as a default state', () => {
			expect( getVerticalForDomainSuggestions( { signup: undefined } ) ).toEqual( '' );
		} );

		test( 'should return vertical id first', () => {
			expect( getVerticalForDomainSuggestions( state ) ).toEqual( 'p4u' );
		} );

		test( 'should return survey vertical if vertical id not available', () => {
			expect(
				getVerticalForDomainSuggestions( {
					signup: {
						steps: {
							survey: {
								vertical: 'test-survey',
								otherText: 'test-other-text',
								siteType: 'test-site-type',
							},
						},
					},
				} )
			).toEqual( 'test-survey' );
		} );
	} );
} );
