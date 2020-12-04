/**
 * Internal dependencies
 */
import { keyToString } from 'calypso/reader/post-key';
import {
	isRequestingSupportArticleAlternates,
	isRequestingSupportArticleAlternatesCompleted,
	isRequestingSupportArticleAlternatesFailed,
	shouldRequestSupportArticleAlternates,
	getSupportArticleAlternates,
	getSupportArticleAlternatesForLocale,
} from '../selectors';

const stateFixtures = {
	items: {
		[ keyToString( { blogId: 1, postId: 1 } ) ]: {
			ar: { blog_id: 2, page_id: 1, link: 'http://example.com' },
			fr: { blog_id: 3, page_id: 1, link: 'http://example.com' },
		},
	},
	requests: {
		[ keyToString( { blogId: 1, postId: 1 } ) ]: { completed: true },
		[ keyToString( { blogId: 1, postId: 2 } ) ]: { failed: true },
		[ keyToString( { blogId: 1, postId: 3 } ) ]: {},
	},
};
const storeState = { supportArticlesAlternates: stateFixtures };

describe( 'selectors', () => {
	describe( 'isRequestingSupportArticleAlternatess()', () => {
		test( 'should return true if article alternates request has been initiated and has not completed or failed yet', () => {
			expect( isRequestingSupportArticleAlternates( storeState, { blogId: 1, postId: 1 } ) ).toBe(
				false
			);
			expect( isRequestingSupportArticleAlternates( storeState, { blogId: 1, postId: 2 } ) ).toBe(
				false
			);
			expect( isRequestingSupportArticleAlternates( storeState, { blogId: 1, postId: 3 } ) ).toBe(
				true
			);
			expect(
				isRequestingSupportArticleAlternates( storeState, { blogId: 9999, postId: 9999 } )
			).toBe( false );
		} );
	} );

	describe( 'isRequestingSupportArticleAlternatesCompleted()', () => {
		test( 'should return true if article alternates request has been flagged as completed', () => {
			expect(
				isRequestingSupportArticleAlternatesCompleted( storeState, { blogId: 1, postId: 1 } )
			).toBe( true );
			expect(
				isRequestingSupportArticleAlternatesCompleted( storeState, { blogId: 1, postId: 2 } )
			).toBe( false );
			expect(
				isRequestingSupportArticleAlternatesCompleted( storeState, { blogId: 1, postId: 3 } )
			).toBe( false );
			expect(
				isRequestingSupportArticleAlternatesCompleted( storeState, { blogId: 9999, postId: 9999 } )
			).toBe( false );
		} );
	} );

	describe( 'isRequestingSupportArticleAlternatesFailed()', () => {
		test( 'should return true if article alternates request has been flagged as failed', () => {
			expect(
				isRequestingSupportArticleAlternatesFailed( storeState, { blogId: 1, postId: 1 } )
			).toBe( false );
			expect(
				isRequestingSupportArticleAlternatesFailed( storeState, { blogId: 1, postId: 2 } )
			).toBe( true );
			expect(
				isRequestingSupportArticleAlternatesFailed( storeState, { blogId: 1, postId: 3 } )
			).toBe( false );
			expect(
				isRequestingSupportArticleAlternatesFailed( storeState, { blogId: 9999, postId: 9999 } )
			).toBe( false );
		} );
	} );

	describe( 'shouldRequestSupportArticleAlternates()', () => {
		test( 'should return true if article alternates request has not been initiated yet or has not been flagged', () => {
			expect( shouldRequestSupportArticleAlternates( storeState, { blogId: 1, postId: 1 } ) ).toBe(
				false
			);
			expect( shouldRequestSupportArticleAlternates( storeState, { blogId: 1, postId: 2 } ) ).toBe(
				false
			);
			expect( shouldRequestSupportArticleAlternates( storeState, { blogId: 1, postId: 3 } ) ).toBe(
				false
			);
			expect(
				shouldRequestSupportArticleAlternates( storeState, { blogId: 9999, postId: 9999 } )
			).toBe( true );
		} );
	} );

	describe( 'getSupportArticleAlternates()', () => {
		test( 'should get all available support article alternates', () => {
			expect( getSupportArticleAlternates( storeState, { blogId: 1, postId: 1 } ) ).toEqual(
				stateFixtures.items[ keyToString( { blogId: 1, postId: 1 } ) ]
			);
			expect( getSupportArticleAlternates( storeState, { blogId: 9999, postId: 9999 } ) ).toBe(
				undefined
			);
		} );
	} );

	describe( 'getSupportArticleAlternatesForLocale()', () => {
		test( 'should get all available support article alternates', () => {
			const locale = 'ar';
			expect(
				getSupportArticleAlternatesForLocale( storeState, { blogId: 1, postId: 1 }, locale )
			).toEqual( stateFixtures.items[ keyToString( { blogId: 1, postId: 1 } ) ][ locale ] );
		} );
	} );
} );
