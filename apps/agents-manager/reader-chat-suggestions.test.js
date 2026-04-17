/**
 * Tests for reader-chat suggestion builder.
 */

const { getReaderSuggestions } = require( './reader-chat-suggestions' );

describe( 'getReaderSuggestions', () => {
	describe( 'blog (non-P2)', () => {
		it( 'returns stream suggestions when no post is provided', () => {
			const suggestions = getReaderSuggestions( {} );
			const ids = suggestions.map( ( s ) => s.id );
			expect( ids ).toContain( 'popular' );
			expect( ids ).toContain( 'about' );
			expect( ids ).toContain( 'recommend' );
		} );

		it( 'returns post suggestions when a post is provided', () => {
			const suggestions = getReaderSuggestions( { currentPost: { title: 'Hello World' } } );
			const ids = suggestions.map( ( s ) => s.id );
			expect( ids ).toContain( 'summarize' );
			expect( ids ).toContain( 'explain' );
			expect( ids ).toContain( 'related' );
		} );

		it( 'includes the post title in prompts', () => {
			const suggestions = getReaderSuggestions( { currentPost: { title: 'My Post' } } );
			const summarize = suggestions.find( ( s ) => s.id === 'summarize' );
			expect( summarize.prompt ).toContain( 'My Post' );
		} );

		it( 'falls back to "this post" when title is missing', () => {
			const suggestions = getReaderSuggestions( { currentPost: {} } );
			const summarize = suggestions.find( ( s ) => s.id === 'summarize' );
			expect( summarize.prompt ).toContain( 'this post' );
		} );

		it( 'returns stream suggestions when config is empty', () => {
			const suggestions = getReaderSuggestions();
			expect( suggestions.length ).toBeGreaterThan( 0 );
			expect( suggestions[ 0 ].id ).toBe( 'popular' );
		} );
	} );

	describe( 'P2', () => {
		it( 'returns P2 stream suggestions when no post is provided', () => {
			const suggestions = getReaderSuggestions( { isP2: true } );
			const ids = suggestions.map( ( s ) => s.id );
			expect( ids ).toContain( 'catch-me-up' );
			expect( ids ).toContain( 'action-items' );
			expect( ids ).toContain( 'recent-decisions' );
			expect( ids ).toContain( 'whos-active' );
		} );

		it( 'returns P2 post suggestions when a post is provided', () => {
			const suggestions = getReaderSuggestions( {
				isP2: true,
				currentPost: { title: 'Team Update', commentCount: 3 },
			} );
			const ids = suggestions.map( ( s ) => s.id );
			expect( ids ).toContain( 'summarize-discussion' );
			expect( ids ).toContain( 'key-decisions' );
			expect( ids ).toContain( 'whos-involved' );
			expect( ids ).toContain( 'open-questions' );
		} );

		it( 'includes comments in summarize-discussion prompt when post has comments', () => {
			const suggestions = getReaderSuggestions( {
				isP2: true,
				currentPost: { title: 'Q3 Planning', commentCount: 5 },
			} );
			const summarize = suggestions.find( ( s ) => s.id === 'summarize-discussion' );
			expect( summarize.prompt ).toContain( 'comments' );
		} );

		it( 'omits comments from summarize-discussion prompt when post has no comments', () => {
			const suggestions = getReaderSuggestions( {
				isP2: true,
				currentPost: { title: 'Q3 Planning', commentCount: 0 },
			} );
			const summarize = suggestions.find( ( s ) => s.id === 'summarize-discussion' );
			expect( summarize.prompt ).not.toContain( 'comments' );
		} );

		it( 'treats missing commentCount as zero', () => {
			const suggestions = getReaderSuggestions( {
				isP2: true,
				currentPost: { title: 'No Count' },
			} );
			const summarize = suggestions.find( ( s ) => s.id === 'summarize-discussion' );
			expect( summarize.prompt ).not.toContain( 'comments' );
		} );
	} );

	describe( 'return shape', () => {
		it( 'every suggestion has id, label, and prompt fields', () => {
			const configs = [
				{},
				{ currentPost: { title: 'Test' } },
				{ isP2: true },
				{ isP2: true, currentPost: { title: 'P2 Post' } },
			];
			configs.forEach( ( config ) => {
				const suggestions = getReaderSuggestions( config );
				suggestions.forEach( ( s ) => {
					expect( typeof s.id ).toBe( 'string' );
					expect( typeof s.label ).toBe( 'string' );
					expect( typeof s.prompt ).toBe( 'string' );
					expect( s.id.length ).toBeGreaterThan( 0 );
					expect( s.label.length ).toBeGreaterThan( 0 );
					expect( s.prompt.length ).toBeGreaterThan( 0 );
				} );
			} );
		} );
	} );
} );
