import { chipFilterToTypes, type ChipFilter } from '../filter';

describe( 'chipFilterToTypes', () => {
	it( 'returns undefined for "all"', () => {
		expect( chipFilterToTypes( 'all' ) ).toBeUndefined();
	} );

	it( 'returns mention,reply,quote for "conversations"', () => {
		expect( chipFilterToTypes( 'conversations' ) ).toBe( 'mention,reply,quote' );
	} );

	it( 'returns "like" for "likes"', () => {
		expect( chipFilterToTypes( 'likes' ) ).toBe( 'like' );
	} );

	it( 'returns "repost" for "reposts"', () => {
		expect( chipFilterToTypes( 'reposts' ) ).toBe( 'repost' );
	} );

	it( 'returns "follow" for "follows"', () => {
		expect( chipFilterToTypes( 'follows' ) ).toBe( 'follow' );
	} );

	it( 'is exhaustive over ChipFilter', () => {
		const chips: ChipFilter[] = [ 'all', 'conversations', 'likes', 'reposts', 'follows' ];
		chips.forEach( ( c ) => {
			expect( () => chipFilterToTypes( c ) ).not.toThrow();
		} );
	} );
} );
