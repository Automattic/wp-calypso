import { isPublicSite } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';

const createSite = ( overrides: Partial< SiteDetails > = {} ) =>
	( {
		ID: 1,
		slug: 'example.wordpress.com',
		is_coming_soon: false,
		is_private: false,
		launch_status: 'launched',
		...overrides,
	} ) as SiteDetails;

describe( 'isPublicSite', () => {
	it( 'is public for a launched site', () => {
		expect( isPublicSite( createSite() ) ).toBe( true );
	} );

	it( 'is public regardless of launch status', () => {
		expect( isPublicSite( createSite( { launch_status: 'unlaunched' } ) ) ).toBe( true );
	} );

	it( 'is public when the visibility flags are absent', () => {
		expect(
			isPublicSite( createSite( { is_coming_soon: undefined, is_private: undefined } ) )
		).toBe( true );
	} );

	it( 'is not public for a coming soon site', () => {
		expect(
			isPublicSite( createSite( { is_coming_soon: true, launch_status: 'unlaunched' } ) )
		).toBe( false );
	} );

	it( 'is not public for a private site', () => {
		expect( isPublicSite( createSite( { is_private: true } ) ) ).toBe( false );
	} );

	it( 'is not public without a site', () => {
		expect( isPublicSite( undefined ) ).toBe( false );
		expect( isPublicSite( null ) ).toBe( false );
	} );
} );
