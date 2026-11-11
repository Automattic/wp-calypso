/**
 * @jest-environment jsdom
 */
jest.mock( '../../../utils/global-styles', () => ( {
	waitForEditedGlobalStyles: jest.fn( () =>
		Promise.resolve( { id: 'global-styles-1', record: { settings: {}, styles: {} } } )
	),
} ) );
jest.mock( '../../../utils/update-theme', () => ( {
	...jest.requireActual( '../../../utils/update-theme' ),
	applyThemeUpdate: jest.fn(),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	THEME_CHECKPOINT_KEYS: [ 'color', 'font', 'button' ],
	withCheckpoint: jest.fn( ( _checkpoint, write ) => write() ),
} ) );

import { THEME_CHECKPOINT_KEYS, withCheckpoint } from '../../../utils/checkpoints';
import { waitForEditedGlobalStyles } from '../../../utils/global-styles';
import { applyThemeUpdate } from '../../../utils/update-theme';
import { applyUpdateThemeCallback } from '../callback';

const SETTINGS = { color: { palette: [ { name: 'Sky', slug: 'sky', color: '#0000ff' } ] } };
const STYLES = { elements: { button: { color: { background: 'var:preset|color|sky' } } } };

const callOrder = ( fn: unknown ) => ( fn as jest.Mock ).mock.invocationCallOrder[ 0 ];

function setEditorPage( isEditor: boolean ) {
	document.body.className = isEditor ? 'site-editor-php' : '';
}

beforeEach( () => {
	jest.clearAllMocks();
	setEditorPage( true );
} );

describe( 'applyUpdateThemeCallback', () => {
	it( 'applies the subtrees that carry data and reports them', async () => {
		const result = await applyUpdateThemeCallback( { settings: SETTINGS, styles: [] } );

		expect( applyThemeUpdate ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'global-styles-1' } ),
			{ settings: { color: { palette: { custom: SETTINGS.color.palette } } } }
		);
		expect( result ).toEqual( {
			result: {
				success: true,
				message: 'Theme updated successfully.',
				details: { updatedSettings: true, updatedStyles: false },
			},
			returnToAgent: true,
		} );
	} );

	it.each( [
		[ 'the trimmed summary', ' Sky blue buttons. ', 'Sky blue buttons.' ],
		[ 'the default for a blank summary', '  ', 'Theme updated successfully.' ],
	] )( 'shows %s as the message', async ( _case, summary, message ) => {
		const result = await applyUpdateThemeCallback( { styles: STYLES, summary } );

		expect( result.result.message ).toBe( message );
	} );

	it( 'waits for the global styles, then writes under a checkpoint', async () => {
		await applyUpdateThemeCallback( {
			settings: SETTINGS,
			summary: 'Added Sky.',
			toolCallId: 'call-1',
		} );

		expect( withCheckpoint ).toHaveBeenCalledWith(
			{
				toolId: 'big_sky__apply_update_theme',
				toolCallId: 'call-1',
				keys: THEME_CHECKPOINT_KEYS,
				summary: 'Added Sky.',
			},
			expect.any( Function )
		);
		expect( callOrder( waitForEditedGlobalStyles ) ).toBeLessThan( callOrder( withCheckpoint ) );
	} );

	it( 'refuses and edits nothing when there is no change to apply', async () => {
		const result = await applyUpdateThemeCallback( { settings: { color: [] }, styles: {} } );

		expect( result.result ).toMatchObject( {
			success: false,
			message: 'Failed to make the theme update. Please try again.',
			error: expect.stringContaining( 'Provide settings or styles' ),
		} );
		expect( applyThemeUpdate ).not.toHaveBeenCalled();
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'refuses off the editor, where the edit would never be saved', async () => {
		setEditorPage( false );

		const result = await applyUpdateThemeCallback( { settings: SETTINGS } );

		expect( result.result.success ).toBe( false );
		expect( waitForEditedGlobalStyles ).not.toHaveBeenCalled();
		expect( applyThemeUpdate ).not.toHaveBeenCalled();
	} );

	it( 'refuses when the global styles never load', async () => {
		( waitForEditedGlobalStyles as jest.Mock ).mockResolvedValueOnce( undefined );

		const result = await applyUpdateThemeCallback( { settings: SETTINGS } );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'Global styles are unavailable to edit.',
		} );
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'reports an error when the write fails', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		( applyThemeUpdate as jest.Mock ).mockImplementationOnce( () => {
			throw new Error( 'Global styles are unavailable to edit.' );
		} );

		const result = await applyUpdateThemeCallback( { settings: SETTINGS } );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'Global styles are unavailable to edit.',
		} );
		expect( error ).toHaveBeenCalled();
	} );
} );
