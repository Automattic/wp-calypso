import { interlaceThemes } from 'calypso/my-sites/themes/helpers';

describe( 'helpers', () => {
	describe( 'interlaceThemes', () => {
		const wpComThemes = [ { id: 'wpcom-theme-1' }, { id: 'wpcom-theme-2' } ];
		const wpOrgThemes = [ { id: 'wporg-theme-1' }, { id: 'wporg-theme-2' } ];

		test( 'includes WP.org themes after WP.com themes when searching a term', () => {
			const interlacedThemes = interlaceThemes( wpComThemes, wpOrgThemes, 'test', true );
			expect( interlacedThemes ).toEqual( [
				{ id: 'wpcom-theme-1' },
				{ id: 'wpcom-theme-2' },
				{ id: 'wporg-theme-1' },
				{ id: 'wporg-theme-2' },
			] );
		} );

		test( 'does not include WP.org themes when not searching a term', () => {
			const interlacedThemes = interlaceThemes( wpComThemes, wpOrgThemes, null, true );
			expect( interlacedThemes ).toEqual( [ { id: 'wpcom-theme-1' }, { id: 'wpcom-theme-2' } ] );
		} );

		test( 'does not include WP.org themes if the last page of WP.com themes has not been reached', () => {
			const interlacedThemes = interlaceThemes( wpComThemes, wpOrgThemes, 'test', false );
			expect( interlacedThemes ).toEqual( [ { id: 'wpcom-theme-1' }, { id: 'wpcom-theme-2' } ] );
		} );

		test( 'returns exact matching WP.com theme as first result', () => {
			const interlacedThemes = interlaceThemes( wpComThemes, wpOrgThemes, 'wpcom-theme-2', true );
			expect( interlacedThemes[ 0 ] ).toEqual( { id: 'wpcom-theme-2' } );
		} );

		test( 'returns exact matching WP.org theme as first result', () => {
			const interlacedThemes = interlaceThemes( wpComThemes, wpOrgThemes, 'wporg-theme-2', true );
			expect( interlacedThemes[ 0 ] ).toEqual( { id: 'wporg-theme-2' } );
		} );

		test( 'Uses the WP.org theme order as-is', () => {
			const wpOrgClassicAndBlockThemes = [
				{ id: 'wporg-classic-theme' },
				{
					id: 'wporg-block-theme',
					taxonomies: { theme_feature: [ { slug: 'full-site-editing' } ] },
				},
			];
			const interlacedThemes = interlaceThemes(
				wpComThemes,
				wpOrgClassicAndBlockThemes,
				'test',
				true
			);
			expect( interlacedThemes[ 2 ].id ).toEqual( 'wporg-classic-theme' );
			expect( interlacedThemes[ 3 ].id ).toEqual( 'wporg-block-theme' );
		} );
	} );
} );
