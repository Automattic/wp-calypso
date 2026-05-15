/**
 * @jest-environment jsdom
 */

import { getConnectorFeatureCards, getSecondaryAdminFeatureCards } from '../feature-cards';

describe( 'getSecondaryAdminFeatureCards', () => {
	test( 'returns exactly one card', () => {
		const { cards } = getSecondaryAdminFeatureCards();
		expect( cards ).toHaveLength( 1 );
	} );

	test( 'card has the expected id and title', () => {
		const { cards } = getSecondaryAdminFeatureCards();
		expect( cards[ 0 ].id ).toBe( 'secondary-admin' );
		expect( cards[ 0 ].title ).toBe( 'Jetpack' );
	} );

	test( 'card has four bullets covering activity log, backups, social, and SSO', () => {
		const { cards } = getSecondaryAdminFeatureCards();
		const bullets = cards[ 0 ].bullets;
		expect( bullets ).toHaveLength( 4 );
		expect( bullets.join( ' ' ) ).toContain( 'activity log' );
		expect( bullets.join( ' ' ) ).toContain( 'Jetpack Cloud' );
		expect( bullets.join( ' ' ) ).toContain( 'Jetpack Social' );
		expect( bullets.join( ' ' ) ).toContain( 'SSO' );
	} );

	test( 'card includes a logo', () => {
		const { cards } = getSecondaryAdminFeatureCards();
		expect( cards[ 0 ].logo ).toBeDefined();
	} );
} );

describe( 'getConnectorFeatureCards', () => {
	test( 'returns cards for known plugin slugs', () => {
		const { cards } = getConnectorFeatureCards( [ 'jetpack' ] );
		expect( cards.length ).toBeGreaterThan( 0 );
		expect( cards[ 0 ].title ).toBe( 'Jetpack' );
	} );

	test( 'returns a fallback card for empty plugin list', () => {
		const { cards } = getConnectorFeatureCards( [] );
		expect( cards.length ).toBeGreaterThan( 0 );
	} );
} );
