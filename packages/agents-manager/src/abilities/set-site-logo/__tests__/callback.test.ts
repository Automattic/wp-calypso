/**
 * @jest-environment jsdom
 */
jest.mock( '../../../utils/site-logo', () => ( {
	hasSiteLogoBlock: jest.fn( () => true ),
	setSiteLogo: jest.fn(),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { LOGO: 'logo' },
	withCheckpoint: jest.fn( ( _checkpoint, write ) => write() ),
} ) );

import { withCheckpoint } from '../../../utils/checkpoints';
import { hasSiteLogoBlock, setSiteLogo } from '../../../utils/site-logo';
import { setSiteLogoCallback } from '../callback';

const FILE_OBJ = { attachment_id: '99', url: 'https://example.com/logo.png' };

function setEditorPage( isEditor: boolean ) {
	document.body.className = isEditor ? 'site-editor-php' : '';
}

beforeEach( () => {
	jest.clearAllMocks();
	setEditorPage( true );
} );

describe( 'setSiteLogoCallback', () => {
	it( 'points the site logo at the attachment', async () => {
		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( setSiteLogo ).toHaveBeenCalledWith( '99' );
		expect( result ).toMatchObject( {
			result: { success: true, details: { attachmentId: '99', url: FILE_OBJ.url } },
			returnToAgent: true,
		} );
	} );

	it( 'sets the logo under a checkpoint carrying the message', async () => {
		await setSiteLogoCallback( {
			fileObj: FILE_OBJ,
			summary: 'Logo updated.',
			toolCallId: 'call-1',
		} );

		expect( withCheckpoint ).toHaveBeenCalledWith(
			{
				toolId: 'big_sky__set_site_logo',
				toolCallId: 'call-1',
				keys: [ 'logo' ],
				summary: 'Logo updated.',
			},
			expect.any( Function )
		);
	} );

	it( 'explains the missing Site Logo block, overriding the summary', async () => {
		( hasSiteLogoBlock as jest.Mock ).mockReturnValueOnce( false );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ, summary: 'All set!' } );

		expect( result.result.success ).toBe( true );
		expect( result.result.message ).toContain( "doesn't include a Site Logo block" );
		expect( setSiteLogo ).toHaveBeenCalledWith( '99' );
	} );

	it( 'keeps the plain confirmation when the block count is unreadable', async () => {
		( hasSiteLogoBlock as jest.Mock ).mockReturnValueOnce( undefined );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.message ).toBe( 'Logo set successfully.' );
	} );

	it.each( [
		[ 'no fileObj', {} ],
		[ 'no attachment id', { fileObj: { url: FILE_OBJ.url } } ],
	] )( 'refuses and edits nothing with %s', async ( _case, input ) => {
		const result = await setSiteLogoCallback( input );

		expect( result.result.success ).toBe( false );
		expect( setSiteLogo ).not.toHaveBeenCalled();
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'refuses off the editor, where the edit would never be saved', async () => {
		setEditorPage( false );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.success ).toBe( false );
		expect( setSiteLogo ).not.toHaveBeenCalled();
	} );

	it( 'reports an error when the site record is unavailable', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		( setSiteLogo as jest.Mock ).mockImplementationOnce( () => {
			throw new Error( 'The site record is unavailable to edit.' );
		} );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'The site record is unavailable to edit.',
		} );
		expect( error ).toHaveBeenCalled();
	} );
} );
