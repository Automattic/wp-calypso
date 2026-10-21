import { getStreamItemKey } from '../utils';
import type { StreamItem } from 'calypso/reader/data/stream';

const wpcomPost = ( blogId: number, postId: number ): StreamItem => ( { blogId, postId } );
const externalPost = ( feedId: number, postId: number ): StreamItem => ( { feedId, postId } );

describe( 'getStreamItemKey', () => {
	it( 'returns distinct keys for two WP.com/Jetpack posts that share a postId across blogs', () => {
		// Two Jetpack blogs whose posts share a `postId`: keyed on `postId`
		// alone, `DataViews.onChangeSelection` returned the already-selected
		// post and the reading pane never updated.
		const a = getStreamItemKey( wpcomPost( 200, 7 ) );
		const b = getStreamItemKey( wpcomPost( 300, 7 ) );
		expect( a ).not.toEqual( b );
	} );

	it( 'returns distinct keys for an external feed item and a blog item that share a postId', () => {
		const blog = getStreamItemKey( wpcomPost( 200, 7 ) );
		const feed = getStreamItemKey( externalPost( 200, 7 ) );
		expect( blog ).not.toEqual( feed );
	} );

	it( 'returns the same key for repeated lookups of the same item', () => {
		const item = wpcomPost( 200, 7 );
		expect( getStreamItemKey( item ) ).toEqual( getStreamItemKey( item ) );
	} );

	it( 'returns the padding postId verbatim for padding rows', () => {
		expect( getStreamItemKey( { isPadding: true, postId: 'padding-3' } ) ).toBe( 'padding-3' );
	} );

	it( 'returns an empty string when postId is missing on a real item', () => {
		expect( getStreamItemKey( { blogId: 200 } as StreamItem ) ).toBe( '' );
	} );
} );
