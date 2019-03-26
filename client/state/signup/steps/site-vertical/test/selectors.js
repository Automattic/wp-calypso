/** @format */

/**
 * Internal dependencies
 */
import {
	getSiteVerticalId,
	getSiteVerticalName,
	getSiteVerticalSlug,
	getSiteVerticalIsUserInput,
	getSiteVerticalPreview,
	getSiteVerticalParentId,
} from '../selectors';

describe( 'selectors', () => {
	const verticals = {
		felice: [
			{ verticalName: 'felice', preview: '<!--gutenberg-besties-forever <p>Fist bump!</p>-->' },
		],
	};

	const state = {
		signup: {
			steps: {
				siteVertical: {
					id: 'p4u',
					name: 'felice',
					slug: 'happy',
					isUserInput: false,
					parentId: 'gluecklich',
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
	describe( 'getSiteVerticalPreview', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalPreview( {} ) ).toBe( '' );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalPreview( state ) ).toEqual( verticals.felice[ 0 ].preview );
		} );
	} );
	describe( '', () => {
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
} );
