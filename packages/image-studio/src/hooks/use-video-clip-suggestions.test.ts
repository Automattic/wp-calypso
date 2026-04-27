import { renderHook } from '@testing-library/react';
import { ImageStudioMode } from '../types';
import {
	buildVideoClipSuggestionsPrompt,
	postBodyToPlainText,
	useVideoClipSuggestions,
} from './use-video-clip-suggestions';

const ENTRY_POINT_FEATURE_CLIP = 'post_editor_feature_clip';
const ENTRY_POINT_MEDIA_LIBRARY = 'media_library';

let mockEditedPostContent = '';
let mockCurrentPostId: string | number | null = 42;

let mockAsyncSuggestions: Array< { id: string; label: string; prompt: string } > = [];
const mockAbortLoading = jest.fn();
let mockIsLoadingSuggestions = false;
let lastAsyncLoaderArgs: {
	prompt: string;
	cacheKey?: string | null;
	enabled?: boolean;
	buildSystemPrompt?: ( suggestionPrompt: string, locale: string ) => string;
} | null = null;

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( callback: ( selector: ( store: unknown ) => unknown ) => unknown ) =>
		callback( () => ( {
			getCurrentPostId: () => mockCurrentPostId,
			getEditedPostContent: () => mockEditedPostContent,
			getEditedPostAttribute: () => mockEditedPostContent,
		} ) )
	),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

jest.mock( '../store', () => ( {
	ImageStudioEntryPoint: {
		MediaLibrary: 'media_library',
		EditorBlock: 'editor_block',
		EditorSidebar: 'editor_sidebar',
		PostEditorFeatureClip: 'post_editor_feature_clip',
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	},
} ) );

jest.mock( './use-async-suggestions-loader', () => ( {
	useAsyncSuggestionsLoader: ( args: {
		prompt: string;
		cacheKey?: string | null;
		enabled?: boolean;
		buildSystemPrompt?: ( suggestionPrompt: string, locale: string ) => string;
	} ) => {
		lastAsyncLoaderArgs = args;
		return {
			suggestions: mockAsyncSuggestions,
			abortLoading: mockAbortLoading,
			isLoading: mockIsLoadingSuggestions,
		};
	},
} ) );

jest.mock( '../utils/agenttic-tracking', () => ( {
	formatSuggestionIds: ( suggestions: Array< { id: string } > ) =>
		'|' + suggestions.map( ( s ) => s.id ).join( '|' ) + '|',
} ) );

const mockTrackSuggestionsRendered = jest.fn();
const mockTrackSuggestionClick = jest.fn();
jest.mock( '../utils/tracking', () => ( {
	trackImageStudioSuggestionsRendered: ( ...args: unknown[] ) =>
		mockTrackSuggestionsRendered( ...args ),
	trackImageStudioSuggestionClick: ( ...args: unknown[] ) => mockTrackSuggestionClick( ...args ),
} ) );

describe( 'postBodyToPlainText', () => {
	it( 'strips HTML tags and Gutenberg block delimiters', () => {
		const raw = '<!-- wp:paragraph --><p>Hello&nbsp;world &amp; friends.</p><!-- /wp:paragraph -->';
		expect( postBodyToPlainText( raw ) ).toBe( 'Hello world & friends.' );
	} );

	it( 'returns empty string for empty input', () => {
		expect( postBodyToPlainText( '' ) ).toBe( '' );
	} );
} );

describe( 'buildVideoClipSuggestionsPrompt', () => {
	it( 'inlines the post body verbatim under POST BODY:', () => {
		const prompt = buildVideoClipSuggestionsPrompt( 'A walk along the beach at sunset.' );
		expect( prompt ).toContain( 'POST BODY:' );
		expect( prompt ).toContain( 'A walk along the beach at sunset.' );
	} );

	it( 'never embeds the gutenberg_page placeholder', () => {
		const prompt = buildVideoClipSuggestionsPrompt( 'sample text' );
		expect( prompt ).not.toContain( '[[client.gutenberg_page' );
	} );

	it( 'truncates very long bodies to keep the prompt focused', () => {
		const longBody = 'x'.repeat( 5000 );
		const prompt = buildVideoClipSuggestionsPrompt( longBody );
		// Find the longest contiguous run of x's anywhere in the prompt — the
		// inlined body should be capped at 2000 characters.
		const xRuns = prompt.match( /x+/g ) ?? [];
		const longestRun = xRuns.reduce( ( max, run ) => Math.max( max, run.length ), 0 );
		expect( longestRun ).toBe( 2000 );
	} );
} );

describe( 'useVideoClipSuggestions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockAsyncSuggestions = [];
		mockIsLoadingSuggestions = false;
		mockEditedPostContent = '';
		mockCurrentPostId = 42;
		lastAsyncLoaderArgs = null;
	} );

	it( 'is a no-op when entryPoint is not PostEditorFeatureClip', () => {
		const registerSuggestions = jest.fn();
		mockEditedPostContent = '<p>Some content</p>';

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions: jest.fn(),
				messages: [],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_MEDIA_LIBRARY as never,
			} )
		);

		expect( registerSuggestions ).not.toHaveBeenCalled();
		expect( lastAsyncLoaderArgs?.enabled ).toBe( false );
	} );

	it( 'sends the post body inline (not the [[...]] placeholder) when active', () => {
		mockEditedPostContent =
			'<!-- wp:paragraph --><p>Migrating birds soaring above coastal cliffs.</p><!-- /wp:paragraph -->';

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_FEATURE_CLIP as never,
			} )
		);

		expect( lastAsyncLoaderArgs ).not.toBeNull();
		expect( lastAsyncLoaderArgs?.enabled ).toBe( true );
		expect( lastAsyncLoaderArgs?.prompt ).toContain(
			'Migrating birds soaring above coastal cliffs.'
		);
		expect( lastAsyncLoaderArgs?.prompt ).not.toContain( '[[client.gutenberg_page' );
		expect( lastAsyncLoaderArgs?.cacheKey ).toBe( 'feature-clip-post-42' );
	} );

	it( 'overrides the loader system prompt with video-tuned framing', () => {
		mockEditedPostContent = '<p>Coastal cliffs at golden hour.</p>';

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_FEATURE_CLIP as never,
			} )
		);

		expect( lastAsyncLoaderArgs?.buildSystemPrompt ).toBeDefined();

		const fullSystemPrompt = lastAsyncLoaderArgs!.buildSystemPrompt!(
			lastAsyncLoaderArgs!.prompt,
			'en'
		);

		// Video-tuned framing is present.
		expect( fullSystemPrompt ).toContain( 'short video-clip prompts' );
		// The post body is inlined inside the full system prompt.
		expect( fullSystemPrompt ).toContain( 'Coastal cliffs at golden hour.' );
		// The default image-oriented framing is NOT present.
		expect( fullSystemPrompt ).not.toContain( 'image generation prompts based on user input' );
		expect( fullSystemPrompt ).not.toContain( 'literal vs abstract, photo vs illustration' );
	} );

	it( 'registers async suggestions once they load', () => {
		mockEditedPostContent = '<p>City skylines at dusk.</p>';
		mockAsyncSuggestions = [
			{ id: 's1', label: 'Skyline', prompt: 'A glowing skyline at dusk.' },
			{ id: 's2', label: 'Bridge', prompt: 'A bridge lit by streetlamps.' },
			{ id: 's3', label: 'River', prompt: 'A river reflecting city lights.' },
		];
		const registerSuggestions = jest.fn();

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions: jest.fn(),
				messages: [],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_FEATURE_CLIP as never,
			} )
		);

		expect( registerSuggestions ).toHaveBeenCalledWith( mockAsyncSuggestions );
	} );

	it( 'clears suggestions once the user has sent a message', () => {
		mockEditedPostContent = '<p>Forest scenes.</p>';
		mockAsyncSuggestions = [ { id: 's1', label: 'L', prompt: 'p' } ];
		const registerSuggestions = jest.fn();
		const clearSuggestions = jest.fn();

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions,
				messages: [ { id: 'm1' } as never ],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_FEATURE_CLIP as never,
			} )
		);

		expect( clearSuggestions ).toHaveBeenCalled();
		expect( registerSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'is disabled when the post body is empty', () => {
		mockEditedPostContent = '';

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
				mode: ImageStudioMode.Generate,
				entryPoint: ENTRY_POINT_FEATURE_CLIP as never,
			} )
		);

		expect( lastAsyncLoaderArgs?.enabled ).toBe( false );
	} );
} );
