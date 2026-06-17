import { mapNotificationsFilter } from '@automattic/api-core';
import { CHIP_FILTERS, type ChipFilter } from '../filter';

describe( 'mapNotificationsFilter', () => {
	it( 'returns undefined for "all"', () => {
		expect( mapNotificationsFilter( 'all' ) ).toBeUndefined();
	} );

	it( 'returns mention,reply,quote for "conversations"', () => {
		expect( mapNotificationsFilter( 'conversations' ) ).toBe( 'mention,reply,quote' );
	} );

	it( 'returns "like" for "likes"', () => {
		expect( mapNotificationsFilter( 'likes' ) ).toBe( 'like' );
	} );

	it( 'returns "repost" for "reposts"', () => {
		expect( mapNotificationsFilter( 'reposts' ) ).toBe( 'repost' );
	} );

	it( 'returns "follow" for "follows"', () => {
		expect( mapNotificationsFilter( 'follows' ) ).toBe( 'follow' );
	} );

	it( 'is exhaustive over the ChipFilter union exposed by CHIP_FILTERS', () => {
		CHIP_FILTERS.forEach( ( c: ChipFilter ) => {
			expect( () => mapNotificationsFilter( c ) ).not.toThrow();
		} );
	} );
} );
