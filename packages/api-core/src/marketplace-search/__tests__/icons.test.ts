import { buildDefaultIconUrl, isGeneratedPluginIcon } from '..';

describe( 'buildDefaultIconUrl', () => {
	it( 'builds the pattern URL wp.org generates for a slug', () => {
		expect( buildDefaultIconUrl( 'jetpack' ) ).toBe(
			'https://s.w.org/plugins/geopattern-icon/jetpack.svg'
		);
	} );
} );

describe( 'isGeneratedPluginIcon', () => {
	it( 'recognises a generated pattern', () => {
		expect( isGeneratedPluginIcon( buildDefaultIconUrl( 'jetpack' ) ) ).toBe( true );
	} );

	it( 'leaves real asset URLs alone', () => {
		expect( isGeneratedPluginIcon( 'https://ps.w.org/jetpack/assets/icon.svg' ) ).toBe( false );
	} );

	it( 'handles a missing icon', () => {
		expect( isGeneratedPluginIcon() ).toBe( false );
		expect( isGeneratedPluginIcon( '' ) ).toBe( false );
	} );
} );
