jest.mock( '../global-styles', () => ( {
	editGlobalStyles: jest.fn(),
	getEditedGlobalStyles: jest.fn(),
} ) );

import { editGlobalStyles, getEditedGlobalStyles } from '../global-styles';
import { applyThemeUpdate, normalizeThemeUpdate } from '../update-theme';

const BASE = { slug: 'base', name: 'Base', color: '#ffffff' };
const ACCENT = { slug: 'accent', name: 'Accent', color: '#ff0000' };
const SERIF = { slug: 'serif', name: 'Serif', fontFamily: 'Georgia, serif' };

const CURRENT = {
	settings: {
		color: { palette: { theme: [ BASE ], custom: [ ACCENT ] } },
		typography: { fontFamilies: { custom: [ SERIF ] } },
	},
	styles: { elements: { heading: { color: { text: '#000000' } } } },
};

function mockGlobalStyles( record: unknown = CURRENT ) {
	( getEditedGlobalStyles as jest.Mock ).mockReturnValue( { id: 'global-styles-1', record } );
}

// Applies the update over `CURRENT` and returns the record written.
function applyOverCurrent( update: Parameters< typeof applyThemeUpdate >[ 0 ] ) {
	mockGlobalStyles();
	applyThemeUpdate( update );

	return ( editGlobalStyles as jest.Mock ).mock.calls[ 0 ][ 1 ];
}

beforeEach( () => jest.clearAllMocks() );

describe( 'normalizeThemeUpdate', () => {
	it( 'keeps the subtrees that carry data', () => {
		const settings = { spacing: { blockGap: '2rem' } };

		expect( normalizeThemeUpdate( { settings, styles: [] } ) ).toEqual( { settings } );
	} );

	it.each( [
		[ 'empty arrays', { settings: [], styles: [] } ],
		[ 'empty objects', { settings: {}, styles: {} } ],
		[ 'non-objects', { settings: 'dark', styles: 12 } ],
		[ 'nothing', {} ],
	] )( 'reads %s as no update', ( _case, input ) => {
		expect( normalizeThemeUpdate( input ) ).toBeUndefined();
	} );
} );

describe( 'applyThemeUpdate', () => {
	it( 'writes the merged record', () => {
		mockGlobalStyles();

		applyThemeUpdate( { styles: { color: { background: '#ff0000' } } } );

		expect( editGlobalStyles ).toHaveBeenCalledWith( 'global-styles-1', {
			settings: CURRENT.settings,
			styles: { ...CURRENT.styles, color: { background: '#ff0000' } },
		} );
	} );

	it( 'nests a flat palette under custom and merges it by slug', () => {
		const accentGreen = { ...ACCENT, color: '#00ff00' };
		const sky = { slug: 'sky', name: 'Sky', color: '#0000ff' };

		const written = applyOverCurrent( {
			settings: { color: { palette: [ accentGreen, sky ] } },
		} );

		expect( written.settings.color ).toEqual( {
			palette: { theme: [ BASE ], custom: [ accentGreen, sky ] },
		} );
	} );

	it( 'still merges a palette by slug when one entry is malformed', () => {
		const accentGreen = { ...ACCENT, color: '#00ff00' };
		const untitled = { slug: 'sky', name: 'Sky' };

		const written = applyOverCurrent( {
			settings: { color: { palette: [ accentGreen, untitled ] } },
		} );

		expect( written.settings.color.palette.custom ).toEqual( [ accentGreen, untitled ] );
	} );

	it( 'replaces arrays other than palettes wholesale', () => {
		const sans = { slug: 'sans', name: 'Sans', fontFamily: 'Arial, sans-serif' };

		const written = applyOverCurrent( {
			settings: { typography: { fontFamilies: { custom: [ sans ] } } },
		} );

		expect( written.settings.typography ).toEqual( { fontFamilies: { custom: [ sans ] } } );
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

	it( 'clears a list with an empty array', () => {
		const written = applyOverCurrent( { settings: { color: { palette: { custom: [] } } } } );

		expect( written.settings.color.palette ).toEqual( { theme: [ BASE ], custom: [] } );
	} );

	it( 'keeps a subtree the backend encoded as an empty array', () => {
		const written = applyOverCurrent( {
			settings: { color: [], spacing: { blockGap: '2rem' } },
		} );

		expect( written.settings ).toEqual( { ...CURRENT.settings, spacing: { blockGap: '2rem' } } );
	} );

	it( 'shares untouched subtrees instead of re-merging them', () => {
		const written = applyOverCurrent( { styles: { color: { text: '#222222' } } } );

		expect( written.settings ).toBe( CURRENT.settings );
	} );

	it( 'does not mutate the edited record it builds on', () => {
		const record = JSON.parse( JSON.stringify( CURRENT ) );
		mockGlobalStyles( record );

		applyThemeUpdate( { settings: { color: { palette: [ { ...ACCENT, color: '#00ff00' } ] } } } );

		expect( record ).toEqual( CURRENT );
	} );

	it( 'throws without writing when the global styles are unavailable', () => {
		( getEditedGlobalStyles as jest.Mock ).mockReturnValue( undefined );

		expect( () => applyThemeUpdate( { styles: { color: { text: '#222222' } } } ) ).toThrow(
			'Global styles are unavailable to edit.'
		);
		expect( editGlobalStyles ).not.toHaveBeenCalled();
	} );
} );
