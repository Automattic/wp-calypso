/**
 * @jest-environment jsdom
 */
import snapshot from '../hub-resource-snapshot.json';
import { hubResources, hubRecommendationIds } from '../hub-resources';

test( 'the snapshot contains only agency-facing material with usable destinations', () => {
	for ( const resource of snapshot.resources ) {
		expect( resource.audiences ).toContain( 'Agency-Facing' );
		expect( resource.audiences ).not.toContain( 'Internal' );
		expect( resource.contentTypes ).not.toContain( 'Internal Trainings' );
	}
	for ( const resource of hubResources ) {
		expect( new URL( resource.url ).protocol ).toBe( 'https:' );
	}
	expect( new Set( hubResources.map( ( resource ) => resource.id ) ).size ).toBe(
		hubResources.length
	);
	expect(
		hubRecommendationIds.every( ( id ) => hubResources.some( ( resource ) => resource.id === id ) )
	).toBe( true );
} );

test( 'hub content keeps its type independently of its file format', () => {
	expect( hubResources.find( ( resource ) => resource.id === 'hub-367' ) ).toMatchObject( {
		contentType: 'Guide',
		format: 'Google Slides',
		product: 'WooCommerce',
	} );
	expect( hubResources.find( ( resource ) => resource.id === 'hub-423' ) ).toMatchObject( {
		contentType: 'Guide',
		format: 'PDF',
		product: 'WordPress VIP',
	} );
} );
