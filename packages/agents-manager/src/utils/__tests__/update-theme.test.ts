jest.mock( '../global-styles', () => ( { editGlobalStyles: jest.fn() } ) );

import { editGlobalStyles } from '../global-styles';
import { applyThemeUpdate, normalizeThemeUpdate } from '../update-theme';

const BASE = { slug: 'base', name: 'Base', color: '#ffffff' };
const ACCENT = { slug: 'accent', name: 'Accent', color: '#ff0000' };
const SERIF = { slug: 'serif', name: 'Serif', fontFamily: 'Georgia, serif' };

const CURRENT = {
	settings: {
		color: { palette: { theme: [ BASE ], custom: [ ACCENT ] } },
		typography: { fontFamilies: { custom: [ SERIF ] } },
		spacing: { units: [ 'px', 'em' ] },
	},
	styles: { elements: { heading: { color: { text: '#000000' } } } },
};
const GLOBAL_STYLES = { id: 'global-styles-1', record: CURRENT };

// Normalizes against `CURRENT`, applies, and returns the record written.
function applyOverCurrent( input: Parameters< typeof normalizeThemeUpdate >[ 0 ] ) {
	const update = normalizeThemeUpdate( input, CURRENT );
	if ( ! update ) {
		throw new Error( 'Nothing to apply.' );
	}
	applyThemeUpdate( GLOBAL_STYLES, update );

	return ( editGlobalStyles as jest.Mock ).mock.calls[ 0 ][ 1 ];
}

beforeEach( () => jest.clearAllMocks() );

describe( 'normalizeThemeUpdate', () => {
	it( 'keeps the subtrees that carry a change', () => {
		const settings = { spacing: { blockGap: '2rem' } };

		expect( normalizeThemeUpdate( { settings, styles: [] }, CURRENT ) ).toEqual( { settings } );
	} );

	it( 'nests flat preset lists under custom', () => {
		const sans = { slug: 'sans', name: 'Sans', fontFamily: 'Arial, sans-serif' };

		expect(
			normalizeThemeUpdate( { settings: { typography: { fontFamilies: [ sans ] } } }, CURRENT )
		).toEqual( { settings: { typography: { fontFamilies: { custom: [ sans ] } } } } );
	} );

	it.each( [
		[ 'empty arrays', { settings: [], styles: [] } ],
		[ 'empty objects', { settings: {}, styles: {} } ],
		[ 'non-objects', { settings: 'dark', styles: 12 } ],
		[ 'nothing', {} ],
		[ "the backend's [] for an empty nested object", { settings: { color: [] } } ],
		[ 'an empty array over a missing list', { settings: { color: { gradients: [] } } } ],
	] )( 'reads %s as no change', ( _case, input ) => {
		expect( normalizeThemeUpdate( input, CURRENT ) ).toBeUndefined();
	} );

	it( 'keeps an empty array that clears a list', () => {
		expect( normalizeThemeUpdate( { settings: { color: { palette: [] } } }, CURRENT ) ).toEqual( {
			settings: { color: { palette: { custom: [] } } },
		} );
	} );
} );

describe( 'applyThemeUpdate', () => {
	it( 'writes the merged record', () => {
		applyThemeUpdate( GLOBAL_STYLES, { styles: { color: { background: '#ff0000' } } } );

		expect( editGlobalStyles ).toHaveBeenCalledWith( 'global-styles-1', {
			settings: CURRENT.settings,
			styles: { ...CURRENT.styles, color: { background: '#ff0000' } },
		} );
	} );

	it( 'merges a flat palette into custom by slug', () => {
		const accentGreen = { ...ACCENT, color: '#00ff00' };
		const sky = { slug: 'sky', name: 'Sky', color: '#0000ff' };

		const written = applyOverCurrent( { settings: { color: { palette: [ accentGreen, sky ] } } } );

		expect( written.settings.color ).toEqual( {
			palette: { theme: [ BASE ], custom: [ accentGreen, sky ] },
		} );
	} );

	it( 'merges other preset lists by slug too', () => {
		const sans = { slug: 'sans', name: 'Sans', fontFamily: 'Arial, sans-serif' };

		const written = applyOverCurrent( { settings: { typography: { fontFamilies: [ sans ] } } } );

		expect( written.settings.typography ).toEqual( { fontFamilies: { custom: [ SERIF, sans ] } } );
	} );

	it( 'still merges by slug when one entry has none', () => {
		const accentGreen = { ...ACCENT, color: '#00ff00' };
		const unslugged = { name: 'Sky', color: '#0000ff' };

		const written = applyOverCurrent( {
			settings: { color: { palette: [ accentGreen, unslugged ] } },
		} );

		expect( written.settings.color.palette.custom ).toEqual( [ accentGreen, unslugged ] );
	} );

	it( 'clears a list with an empty array', () => {
		const written = applyOverCurrent( { settings: { color: { palette: [] } } } );

		expect( written.settings.color.palette ).toEqual( { theme: [ BASE ], custom: [] } );
	} );

	it( 'replaces arrays without slugs wholesale', () => {
		const written = applyOverCurrent( { settings: { spacing: { units: [ 'rem' ] } } } );

		expect( written.settings.spacing ).toEqual( { units: [ 'rem' ] } );
	} );

	it( 'key-merges nested styles', () => {
		const written = applyOverCurrent( {
			styles: { elements: { button: { color: { background: '#3498db' } } } },
		} );

		expect( written.styles ).toEqual( {
			elements: {
				heading: { color: { text: '#000000' } },
				button: { color: { background: '#3498db' } },
			},
		} );
	} );

	it( 'shares untouched subtrees instead of re-merging them', () => {
		const written = applyOverCurrent( { styles: { color: { text: '#222222' } } } );

		expect( written.settings ).toBe( CURRENT.settings );
	} );

	it( 'does not mutate the record it builds on', () => {
		const record = JSON.parse( JSON.stringify( CURRENT ) );

		applyThemeUpdate(
			{ id: 'global-styles-1', record },
			{ settings: { color: { palette: { custom: [ { ...ACCENT, color: '#00ff00' } ] } } } }
		);

		expect( record ).toEqual( CURRENT );
	} );
} );
