import { describe, expect, it } from 'vitest';
import { mergePost } from '../editor/merge';

const post = ( blocks: string[], title = 'Title' ) => ( { title, blocks } );

describe( 'mergePost', () => {
	describe( 'title', () => {
		it( 'takes the server title when the user kept the base one', () => {
			expect( mergePost( post( [] ), post( [] ), post( [], 'New' ) ).title ).toBe( 'New' );
		} );

		it( 'keeps the user title when the server kept the base one', () => {
			expect( mergePost( post( [] ), post( [], 'Mine' ), post( [] ) ).title ).toBe( 'Mine' );
		} );

		it( 'keeps the user title when both changed it', () => {
			expect( mergePost( post( [] ), post( [], 'Mine' ), post( [], 'Theirs' ) ).title ).toBe(
				'Mine'
			);
		} );
	} );

	describe( 'blocks', () => {
		const base = post( [ 'a', 'b', 'c' ] );

		it( 'takes the server blocks when the user changed none', () => {
			expect( mergePost( base, base, post( [ 'a', 'x' ] ) ).blocks ).toEqual( [ 'a', 'x' ] );
		} );

		it( 'keeps the user blocks when the server changed none', () => {
			expect( mergePost( base, post( [ 'a' ] ), base ).blocks ).toEqual( [ 'a' ] );
		} );

		it( 'merges edits to different blocks', () => {
			expect(
				mergePost( base, post( [ 'A', 'b', 'c' ] ), post( [ 'a', 'b', 'C' ] ) ).blocks
			).toEqual( [ 'A', 'b', 'C' ] );
		} );

		it( 'keeps the user edit when the server added and removed blocks', () => {
			expect(
				mergePost( base, post( [ 'a', 'B', 'c' ] ), post( [ 'b', 'c', 'd' ] ) ).blocks
			).toEqual( [ 'B', 'c', 'd' ] );
		} );

		it( 'keeps the user edit when the server inserted a block before it', () => {
			expect(
				mergePost( base, post( [ 'a', 'b', 'C' ] ), post( [ 'x', 'a', 'b', 'c' ] ) ).blocks
			).toEqual( [ 'x', 'a', 'b', 'C' ] );
		} );

		it( 'keeps both versions when both edited the same block', () => {
			expect(
				mergePost( base, post( [ 'a', 'B1', 'c' ] ), post( [ 'a', 'B2', 'c' ] ) ).blocks
			).toEqual( [ 'a', 'B1', 'B2', 'c' ] );
		} );

		it( 'keeps the user edit to a block the server removed', () => {
			expect( mergePost( base, post( [ 'a', 'B', 'c' ] ), post( [ 'a', 'c' ] ) ).blocks ).toEqual( [
				'a',
				'B',
				'c',
			] );
		} );

		it( 'applies server edits to the blocks the user kept when the user added a block', () => {
			expect(
				mergePost( base, post( [ 'a', 'b', 'new', 'c' ] ), post( [ 'A', 'b', 'C' ] ) ).blocks
			).toEqual( [ 'A', 'b', 'new', 'C' ] );
		} );

		it( 'drops a server edit to a block the user removed', () => {
			expect( mergePost( base, post( [ 'a', 'c' ] ), post( [ 'a', 'B', 'c' ] ) ).blocks ).toEqual( [
				'a',
				'c',
			] );
		} );

		it( 'keeps the user blocks when both added or removed blocks', () => {
			expect(
				mergePost( base, post( [ 'a', 'b' ] ), post( [ 'a', 'b', 'c', 'd' ] ) ).blocks
			).toEqual( [ 'a', 'b' ] );
		} );

		it( 'returns the user blocks when both sides have the same blocks', () => {
			expect(
				mergePost( base, post( [ 'a', 'B', 'c' ] ), post( [ 'a', 'B', 'c' ] ) ).blocks
			).toEqual( [ 'a', 'B', 'c' ] );
		} );

		it( 'matches a server block that equals the user edit instead of adding a copy', () => {
			expect(
				mergePost( base, post( [ 'a', 'B', 'c' ] ), post( [ 'x', 'a', 'B', 'c' ] ) ).blocks
			).toEqual( [ 'x', 'a', 'B', 'c' ] );
		} );

		it( 'replaces the user’s own earlier save with what they typed since', () => {
			expect(
				mergePost(
					base,
					post( [ 'a', 'B2', 'c' ] ),
					post( [ 'a', 'B', 'c' ] ),
					post( [ 'a', 'B', 'c' ] )
				).blocks
			).toEqual( [ 'a', 'B2', 'c' ] );
		} );

		it( 'keeps a server edit next to the user’s own earlier save', () => {
			expect(
				mergePost(
					base,
					post( [ 'a', 'B2', 'c' ] ),
					post( [ 'A', 'B', 'c' ] ),
					post( [ 'a', 'B', 'c' ] )
				).blocks
			).toEqual( [ 'A', 'B2', 'c' ] );
		} );

		it( 'puts the user edit where the server moved its block', () => {
			expect(
				mergePost( post( [ 'a', 'b' ] ), post( [ 'a', 'B' ] ), post( [ 'b', 'a' ] ) ).blocks
			).toEqual( [ 'B', 'a' ] );
		} );

		it( 'replaces only the user’s earlier save of the same block', () => {
			// The earlier save changed c, not b: the server's X replaced b, so B is kept next to it.
			expect(
				mergePost(
					base,
					post( [ 'a', 'B', 'c' ] ),
					post( [ 'a', 'X', 'C' ] ),
					post( [ 'a', 'b', 'C' ] )
				).blocks
			).toEqual( [ 'a', 'B', 'X', 'C' ] );
		} );

		it( 'matches duplicate blocks in order', () => {
			const dupes = post( [ 'p', 'p', 'p' ] );
			expect(
				mergePost( dupes, post( [ 'p', 'P', 'p' ] ), post( [ 'x', 'p', 'p', 'p' ] ) ).blocks
			).toEqual( [ 'x', 'p', 'P', 'p' ] );
		} );
	} );
} );
