/**
 * @jest-environment jsdom
 */
jest.mock( '../../../utils/site-logo', () => ( {
	hasSiteLogoBlock: jest.fn( () => true ),
	setSiteLogo: jest.fn(),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { LOGO: 'logo' },
	clearCheckpoint: jest.fn(),
	hasCheckpoint: jest.fn( () => false ),
	setCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => 'call-1' ),
} ) );

import { clearCheckpoint, hasCheckpoint, setCheckpoint } from '../../../utils/checkpoints';
import { hasSiteLogoBlock, setSiteLogo } from '../../../utils/site-logo';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { setSiteLogoCallback } from '../callback';

const FILE_OBJ = { attachment_id: '99', url: 'https://example.com/logo.png' };

function setEditorPage( isEditor: boolean ) {
	document.body.className = isEditor ? 'site-editor-php' : '';
}

beforeEach( () => {
	jest.clearAllMocks();
	setEditorPage( true );
	( hasSiteLogoBlock as jest.Mock ).mockReturnValue( true );
	( hasCheckpoint as jest.Mock ).mockReturnValue( false );
	( getToolCallIdFromConversationHistory as jest.Mock ).mockReturnValue( 'call-1' );
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

	it( 'snapshots the previous logo under the tool call id', async () => {
		await setSiteLogoCallback( { fileObj: FILE_OBJ, summary: 'Logo updated.' } );

		expect( setCheckpoint ).toHaveBeenCalledWith( 'call-1', [ 'logo' ], {
			toolId: 'big_sky__set_site_logo',
			summary: 'Logo updated.',
		} );
	} );

	it( 'explains the missing Site Logo block, overriding the summary', async () => {
		( hasSiteLogoBlock as jest.Mock ).mockReturnValue( false );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ, summary: 'All set!' } );

		expect( result.result.success ).toBe( true );
		expect( result.result.message ).toContain( "doesn't include a Site Logo block" );
		expect( setSiteLogo ).toHaveBeenCalledWith( '99' );
	} );

	it( 'keeps the plain confirmation when the block count is unreadable', async () => {
		( hasSiteLogoBlock as jest.Mock ).mockReturnValue( undefined );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.message ).toBe( 'Logo set successfully.' );
	} );

	it( 'still sets the logo when the tool call id is unknown, without a checkpoint', async () => {
		( getToolCallIdFromConversationHistory as jest.Mock ).mockReturnValue( null );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.success ).toBe( true );
		expect( setSiteLogo ).toHaveBeenCalledWith( '99' );
		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'keeps the first snapshot when the same call sets a logo again', async () => {
		( hasCheckpoint as jest.Mock ).mockReturnValue( true );

		await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( setCheckpoint ).not.toHaveBeenCalled();
		expect( setSiteLogo ).toHaveBeenCalled();
	} );

	it.each( [
		[ 'no fileObj', {} ],
		[ 'no attachment id', { fileObj: { url: FILE_OBJ.url } } ],
	] )( 'refuses and edits nothing with %s', async ( _case, input ) => {
		const result = await setSiteLogoCallback( input );

		expect( result.result.success ).toBe( false );
		expect( setSiteLogo ).not.toHaveBeenCalled();
		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'refuses off the editor, where the edit would never be saved', async () => {
		setEditorPage( false );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.success ).toBe( false );
		expect( setSiteLogo ).not.toHaveBeenCalled();
	} );

	it( 'reports an error when the site record is unavailable', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		( setSiteLogo as jest.Mock ).mockImplementation( () => {
			throw new Error( 'The site record is unavailable to edit.' );
		} );

		const result = await setSiteLogoCallback( { fileObj: FILE_OBJ } );

		expect( result.result.success ).toBe( false );
		expect( error ).toHaveBeenCalled();
		// No undo is offered for a change that never happened.
		expect( clearCheckpoint ).toHaveBeenCalledWith( 'call-1' );
	} );
} );
