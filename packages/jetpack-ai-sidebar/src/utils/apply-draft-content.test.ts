/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/blocks', () => ( {
	parse: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { parse } from '@wordpress/blocks';
import {
	APPLY_DRAFT_CONTENT_ABILITY,
	APPLY_DRAFT_CONTENT_ABILITY_NAME,
	APPLY_DRAFT_CONTENT_TOOL_ID,
	handleApplyDraftContent,
	isApplyDraftContentTool,
} from './apply-draft-content';

const mockedParse = parse as jest.MockedFunction< typeof parse >;
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const PARAGRAPH_BLOCK = { name: 'core/paragraph', attributes: { content: 'Drafted.' } } as any;
const MARKUP = '<!-- wp:paragraph --><p>Drafted.</p><!-- /wp:paragraph -->';

function installEditorMock( {
	isEmpty = true,
	withEditor = true,
	withBlockEditor = true,
	resetBlocksThrows = false,
	editPostThrows = false,
}: {
	isEmpty?: boolean;
	withEditor?: boolean;
	withBlockEditor?: boolean;
	resetBlocksThrows?: boolean;
	editPostThrows?: boolean;
} = {} ) {
	const editPost = jest.fn( () => {
		if ( editPostThrows ) {
			throw new Error( 'editPost failed' );
		}
	} );
	const resetBlocks = jest.fn( () => {
		if ( resetBlocksThrows ) {
			throw new Error( 'resetBlocks failed' );
		}
	} );
	const isEditedPostEmpty = jest.fn( () => isEmpty );

	( window as any ).wp = {
		data: {
			select: ( store: string ) =>
				store === 'core/editor' && withEditor ? { isEditedPostEmpty } : undefined,
			dispatch: ( store: string ) => {
				if ( store === 'core/editor' && withEditor ) {
					return { editPost };
				}
				if ( store === 'core/block-editor' && withBlockEditor ) {
					return { resetBlocks };
				}
				return undefined;
			},
		},
	};

	return { editPost, resetBlocks, isEditedPostEmpty };
}

function getTracksCalls( eventName: string ) {
	return mockedRecordTracksEvent.mock.calls.filter( ( [ name ] ) => name === eventName );
}

describe( 'apply-draft-content ability descriptor', () => {
	it( 'registers under the ability name with the normalized tool id', () => {
		expect( APPLY_DRAFT_CONTENT_ABILITY_NAME ).toBe( 'jetpack-ai/apply-draft-content' );
		expect( APPLY_DRAFT_CONTENT_TOOL_ID ).toBe( 'jetpack_ai__apply_draft_content' );
		expect( APPLY_DRAFT_CONTENT_ABILITY.id ).toBe( APPLY_DRAFT_CONTENT_TOOL_ID );
		expect( APPLY_DRAFT_CONTENT_ABILITY.name ).toBe( APPLY_DRAFT_CONTENT_ABILITY_NAME );
		expect( APPLY_DRAFT_CONTENT_ABILITY.input_schema.required ).toEqual( [
			'markup',
			'contentType',
			'summary',
		] );
	} );

	it( 'matches both the raw and the AM-normalized tool id', () => {
		expect( isApplyDraftContentTool( 'jetpack-ai/apply-draft-content' ) ).toBe( true );
		expect( isApplyDraftContentTool( 'jetpack_ai__apply_draft_content' ) ).toBe( true );
		expect( isApplyDraftContentTool( 'wpcom/update-block-content' ) ).toBe( false );
		expect( isApplyDraftContentTool( 'jetpack_ai__show_component' ) ).toBe( false );
	} );
} );

describe( 'handleApplyDraftContent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedParse.mockReturnValue( [ PARAGRAPH_BLOCK ] );
	} );

	afterEach( () => {
		delete ( window as any ).wp;
	} );

	it( 'writes the parsed blocks into an empty post', () => {
		const { resetBlocks } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
		} );

		expect( mockedParse ).toHaveBeenCalledWith( MARKUP );
		expect( resetBlocks ).toHaveBeenCalledWith( [ PARAGRAPH_BLOCK ] );
		expect( result ).toMatchObject( {
			success: true,
			blockCount: 1,
			titleUpdated: false,
			returnToAgent: false,
			agentMessage: 'Drafted an intro.',
		} );
	} );

	it( 'refuses and leaves the canvas untouched when the post is not empty', () => {
		const { resetBlocks, editPost } = installEditorMock( { isEmpty: false } );

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
			title: 'A title that must not land',
		} );

		expect( resetBlocks ).not.toHaveBeenCalled();
		expect( editPost ).not.toHaveBeenCalled();
		expect( result.success ).toBe( false );
		expect( result.error ).toMatch( /already has content/ );
		// The agent needs the refusal so it can tell the user why nothing happened.
		expect( result.returnToAgent ).toBe( true );
		expect( getTracksCalls( 'jetpack_ai_draft_assist_draft_rejected' ) ).toEqual( [
			[
				'jetpack_ai_draft_assist_draft_rejected',
				{ content_type: 'post', reason: 'post_not_empty' },
			],
		] );
	} );

	it( 'sets the title when one is supplied', () => {
		const { editPost } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'page',
			summary: 'Drafted a page.',
			title: 'About us',
		} );

		expect( editPost ).toHaveBeenCalledWith( { title: 'About us' } );
		expect( result.titleUpdated ).toBe( true );
	} );

	it.each( [
		[ 'omitted', undefined ],
		[ 'empty', '' ],
		[ 'whitespace-only', '   ' ],
	] )( 'leaves the title alone when it is %s', ( _label, title ) => {
		const { editPost, resetBlocks } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
			title,
		} );

		expect( editPost ).not.toHaveBeenCalled();
		expect( resetBlocks ).toHaveBeenCalledTimes( 1 );
		expect( result ).toMatchObject( { success: true, titleUpdated: false } );
	} );

	it( 'fails without blanking the post when the markup parses to no blocks', () => {
		mockedParse.mockReturnValue( [] );
		const { resetBlocks, editPost } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: 'not really block markup',
			contentType: 'post',
			summary: 'Drafted an intro.',
			title: 'Unwanted',
		} );

		expect( resetBlocks ).not.toHaveBeenCalled();
		expect( editPost ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( { success: false, returnToAgent: true } );
		expect( result.error ).toMatch( /could not be parsed/ );
		expect( getTracksCalls( 'jetpack_ai_draft_assist_draft_rejected' ) ).toEqual( [
			[
				'jetpack_ai_draft_assist_draft_rejected',
				{ content_type: 'post', reason: 'invalid_markup' },
			],
		] );
	} );

	it( 'fails without blanking the post when parsing throws', () => {
		mockedParse.mockImplementation( () => {
			throw new Error( 'bad markup' );
		} );
		const { resetBlocks } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
		} );

		expect( resetBlocks ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( { success: false, returnToAgent: true } );
	} );

	it.each( [
		[ 'missing', undefined ],
		[ 'empty', '' ],
		[ 'whitespace-only', '  \n ' ],
		[ 'not a string', 42 ],
	] )( 'rejects %s markup before reading the editor', ( _label, markup ) => {
		const { isEditedPostEmpty } = installEditorMock();

		const result = handleApplyDraftContent( { markup, contentType: 'post', summary: 'x' } );

		expect( isEditedPostEmpty ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( { success: false, returnToAgent: true } );
		expect( result.error ).toMatch( /markup is required/ );
	} );

	it( 'fails cleanly when the editor store is unavailable', () => {
		( window as any ).wp = {};

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
		} );

		expect( result ).toMatchObject( { success: false, returnToAgent: true } );
		expect( result.error ).toMatch( /Editor not available/ );
		expect( getTracksCalls( 'jetpack_ai_draft_assist_draft_rejected' ) ).toEqual( [
			[
				'jetpack_ai_draft_assist_draft_rejected',
				{ content_type: 'post', reason: 'editor_unavailable' },
			],
		] );
	} );

	it( 'does not touch the title when the block write fails', () => {
		const { editPost } = installEditorMock( { resetBlocksThrows: true } );

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
			title: 'Unwanted',
		} );

		expect( editPost ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( { success: false, returnToAgent: true } );
	} );

	it( 'keeps the draft when only the title write fails', () => {
		const { resetBlocks } = installEditorMock( { editPostThrows: true } );

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
			title: 'Best effort',
		} );

		expect( resetBlocks ).toHaveBeenCalledTimes( 1 );
		expect( result ).toMatchObject( { success: true, titleUpdated: false } );
	} );

	it( 'tracks an applied draft with aggregate metadata only', () => {
		mockedParse.mockReturnValue( [ PARAGRAPH_BLOCK, PARAGRAPH_BLOCK ] );
		installEditorMock();

		handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'page',
			summary: 'Drafted a page.',
			title: 'About us',
		} );

		const [ call ] = getTracksCalls( 'jetpack_ai_draft_assist_draft_applied' );
		expect( call[ 1 ] ).toEqual( {
			content_type: 'page',
			block_count: 2,
			has_title: true,
		} );
		expect( call[ 1 ] ).not.toHaveProperty( 'title' );
		expect( call[ 1 ] ).not.toHaveProperty( 'markup' );
		expect( call[ 1 ] ).not.toHaveProperty( 'summary' );
	} );

	it( 'omits the agent message when no summary is provided', () => {
		installEditorMock();

		const result = handleApplyDraftContent( { markup: MARKUP, contentType: 'post' } );

		expect( result.success ).toBe( true );
		expect( result ).not.toHaveProperty( 'agentMessage' );
	} );
} );
