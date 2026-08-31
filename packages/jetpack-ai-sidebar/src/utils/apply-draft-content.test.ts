/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock( '@wordpress/blocks', () => ( {
	parse: jest.fn(),
} ) );

import { parse } from '@wordpress/blocks';
import {
	APPLY_DRAFT_CONTENT_ABILITY,
	APPLY_DRAFT_CONTENT_ABILITY_NAME,
	APPLY_DRAFT_CONTENT_TOOL_ID,
	handleApplyDraftContent,
	isApplyDraftContentTool,
} from './apply-draft-content';

const mockedParse = parse as jest.MockedFunction< typeof parse >;

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		recordBigSkyTracksEvent?: ( eventName: string, props?: Record< string, unknown > ) => void;
	};
};

const mockRecordBigSkyTracksEvent = jest.fn();

const PARAGRAPH_BLOCK = { name: 'core/paragraph', attributes: { content: 'Drafted.' } } as any;
const MARKUP = '<!-- wp:paragraph --><p>Drafted.</p><!-- /wp:paragraph -->';

function installEditorMock( {
	isEmpty = true,
	postType = 'post',
	existingTitle = '',
	withEditor = true,
	withBlockEditor = true,
	withTitleSelector = true,
	resetBlocksThrows = false,
	editPostThrows = false,
}: {
	isEmpty?: boolean;
	/** `null` stands for an editor that has not resolved a post type yet. */
	postType?: string | null;
	existingTitle?: string;
	withEditor?: boolean;
	withBlockEditor?: boolean;
	withTitleSelector?: boolean;
	resetBlocksThrows?: boolean;
	editPostThrows?: boolean;
} = {} ) {
	let currentTitle = existingTitle;
	const editPost = jest.fn( ( edits: { title?: string } ) => {
		if ( editPostThrows ) {
			throw new Error( 'editPost failed' );
		}
		if ( typeof edits?.title === 'string' ) {
			currentTitle = edits.title;
		}
	} );
	const resetBlocks = jest.fn( () => {
		if ( resetBlocksThrows ) {
			throw new Error( 'resetBlocks failed' );
		}
	} );
	const isEditedPostEmpty = jest.fn( () => isEmpty );
	const getCurrentPostType = jest.fn( () => postType ?? undefined );
	const getEditedPostAttribute = jest.fn( ( attribute: string ) =>
		attribute === 'title' ? currentTitle : undefined
	);

	( window as any ).wp = {
		data: {
			select: ( store: string ) =>
				store === 'core/editor' && withEditor
					? {
							isEditedPostEmpty,
							getCurrentPostType,
							...( withTitleSelector ? { getEditedPostAttribute } : {} ),
					  }
					: undefined,
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

	return {
		editPost,
		resetBlocks,
		isEditedPostEmpty,
		getCurrentPostType,
		getEditedPostAttribute,
		getTitle: () => currentTitle,
	};
}

function getTracksCalls( eventName: string ) {
	return mockRecordBigSkyTracksEvent.mock.calls.filter( ( [ name ] ) => name === eventName );
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
		( window as WindowWithAgentsManagerActions ).__agentsManagerActions = {
			recordBigSkyTracksEvent: mockRecordBigSkyTracksEvent,
		};
	} );

	afterEach( () => {
		delete ( window as any ).wp;
		delete ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
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
		expect( getTracksCalls( 'jetpack_big_sky_draft_assist_draft_rejected' ) ).toEqual( [
			[
				'jetpack_big_sky_draft_assist_draft_rejected',
				{ content_type: 'post', reason: 'post_not_empty' },
			],
		] );
	} );

	it( 'sets the title when one is supplied and the post has none', () => {
		const { editPost } = installEditorMock();

		const result = handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'page',
			summary: 'Drafted a page.',
			title: 'About us',
		} );

		expect( editPost ).toHaveBeenCalledWith( { title: 'About us' } );
		expect( result ).toMatchObject( { titleUpdated: true, titleSkipped: false } );
	} );

	it( 'trims the title it writes', () => {
		const { editPost, getTitle } = installEditorMock();

		handleApplyDraftContent( {
			markup: MARKUP,
			contentType: 'post',
			summary: 'Drafted an intro.',
			title: '  Spaced out  ',
		} );

		expect( editPost ).toHaveBeenCalledWith( { title: 'Spaced out' } );
		expect( getTitle() ).toBe( 'Spaced out' );
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
		expect( result ).toMatchObject( { success: true, titleUpdated: false, titleSkipped: false } );
	} );

	describe( 'a title the user already typed', () => {
		// `isEditedPostEmpty()` is content-only — it ignores the title entirely
		// (Gutenberg `packages/editor/src/store/selectors.js`). So the post can be
		// "empty" and still carry a title the user typed, and the handler has to
		// protect it itself rather than trusting the model to omit `title`.
		it( 'keeps the existing title and still writes the body', () => {
			const { editPost, resetBlocks, getTitle } = installEditorMock( {
				existingTitle: 'My own title',
			} );

			const result = handleApplyDraftContent( {
				markup: MARKUP,
				contentType: 'post',
				summary: 'Drafted an intro.',
				title: 'A title the model preferred',
			} );

			expect( editPost ).not.toHaveBeenCalled();
			expect( getTitle() ).toBe( 'My own title' );
			expect( resetBlocks ).toHaveBeenCalledWith( [ PARAGRAPH_BLOCK ] );
			expect( result ).toMatchObject( {
				success: true,
				blockCount: 1,
				titleUpdated: false,
				// Reported so the agent can tell the user their title was kept.
				titleSkipped: true,
			} );
		} );

		it( 'treats a whitespace-only existing title as no title', () => {
			const { editPost } = installEditorMock( { existingTitle: '   ' } );

			const result = handleApplyDraftContent( {
				markup: MARKUP,
				contentType: 'post',
				summary: 'Drafted an intro.',
				title: 'Generated title',
			} );

			expect( editPost ).toHaveBeenCalledWith( { title: 'Generated title' } );
			expect( result ).toMatchObject( { titleUpdated: true, titleSkipped: false } );
		} );

		it( 'skips the title write when the current title cannot be read', () => {
			const { editPost, resetBlocks } = installEditorMock( { withTitleSelector: false } );

			const result = handleApplyDraftContent( {
				markup: MARKUP,
				contentType: 'post',
				summary: 'Drafted an intro.',
				title: 'Generated title',
			} );

			expect( editPost ).not.toHaveBeenCalled();
			expect( resetBlocks ).toHaveBeenCalledTimes( 1 );
			expect( result ).toMatchObject( { success: true, titleUpdated: false, titleSkipped: true } );
		} );
	} );

	describe( 'post type guard', () => {
		// The ability is granted on every editor surface. In the site editor
		// `core/editor` serves templates, where an empty entity is normal and a
		// draft would become site-wide content.
		it.each( [
			[ 'a template', 'wp_template' ],
			[ 'a template part', 'wp_template_part' ],
			[ 'a pattern', 'wp_block' ],
			[ 'an unresolved post type', null ],
		] )( 'refuses to write into %s', ( _label, postType ) => {
			const { resetBlocks, editPost, isEditedPostEmpty } = installEditorMock( { postType } );

			const result = handleApplyDraftContent( {
				markup: MARKUP,
				contentType: 'post',
				summary: 'Drafted an intro.',
				title: 'Unwanted',
			} );

			expect( resetBlocks ).not.toHaveBeenCalled();
			expect( editPost ).not.toHaveBeenCalled();
			expect( isEditedPostEmpty ).not.toHaveBeenCalled();
			expect( result ).toMatchObject( { success: false, returnToAgent: true } );
			expect( result.error ).toMatch( /only writes into posts and pages/ );
			expect( getTracksCalls( 'jetpack_big_sky_draft_assist_draft_rejected' ) ).toEqual( [
				[
					'jetpack_big_sky_draft_assist_draft_rejected',
					{ content_type: 'post', reason: 'unsupported_post_type' },
				],
			] );
		} );

		it.each( [ [ 'post' ], [ 'page' ] ] )( 'writes into a %s', ( postType ) => {
			const { resetBlocks } = installEditorMock( { postType } );

			const result = handleApplyDraftContent( {
				markup: MARKUP,
				contentType: postType,
				summary: 'Drafted.',
			} );

			expect( resetBlocks ).toHaveBeenCalledWith( [ PARAGRAPH_BLOCK ] );
			expect( result.success ).toBe( true );
		} );
	} );

	describe( 'markup parsing', () => {
		// `@wordpress/blocks` is externalized to the host's `wp.blocks`. Its real
		// `parse()` turns text that is not block markup into freeform /
		// `core/missing` blocks — it does not return `[]` and does not throw. The
		// mock below mirrors that instead of manufacturing a rejection path
		// production never takes.
		it( 'applies freeform output from plain, non-block text', () => {
			const freeform = { name: 'core/freeform', attributes: { content: 'Just prose.' } } as any;
			mockedParse.mockReturnValue( [ freeform ] );
			const { resetBlocks } = installEditorMock();

			const result = handleApplyDraftContent( {
				markup: 'Just prose.',
				contentType: 'post',
				summary: 'Drafted an intro.',
			} );

			// Acceptable: the post is empty by the guard above, so nothing is lost.
			expect( resetBlocks ).toHaveBeenCalledWith( [ freeform ] );
			expect( result ).toMatchObject( { success: true, blockCount: 1 } );
		} );

		it( 'applies core/missing blocks from markup naming unknown blocks', () => {
			const missing = { name: 'core/missing', attributes: { originalName: 'acme/widget' } } as any;
			mockedParse.mockReturnValue( [ missing ] );
			const { resetBlocks } = installEditorMock();

			const result = handleApplyDraftContent( {
				markup: '<!-- wp:acme/widget /-->',
				contentType: 'post',
				summary: 'Drafted an intro.',
			} );

			expect( resetBlocks ).toHaveBeenCalledWith( [ missing ] );
			expect( result.success ).toBe( true );
		} );

		it( 'is defensive about a parser that returns nothing, which the real one does not', () => {
			mockedParse.mockReturnValue( [] );
			const { resetBlocks, editPost } = installEditorMock();

			const result = handleApplyDraftContent( {
				markup: 'not really block markup',
				contentType: 'post',
				summary: 'Drafted an intro.',
				title: 'Unwanted',
			} );

			// The point of the branch: an empty parse must never blank the canvas.
			expect( resetBlocks ).not.toHaveBeenCalled();
			expect( editPost ).not.toHaveBeenCalled();
			expect( result ).toMatchObject( { success: false, returnToAgent: true } );
			expect( result.error ).toMatch( /could not be parsed/ );
			expect( getTracksCalls( 'jetpack_big_sky_draft_assist_draft_rejected' ) ).toEqual( [
				[
					'jetpack_big_sky_draft_assist_draft_rejected',
					{ content_type: 'post', reason: 'invalid_markup' },
				],
			] );
		} );

		it( 'is defensive about a parser that throws, which the real one does not', () => {
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
		expect( getTracksCalls( 'jetpack_big_sky_draft_assist_draft_rejected' ) ).toEqual( [
			[
				'jetpack_big_sky_draft_assist_draft_rejected',
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

		const [ call ] = getTracksCalls( 'jetpack_big_sky_draft_assist_draft_applied' );
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
