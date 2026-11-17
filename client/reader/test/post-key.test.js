import { isSavedSnapshotPost, keyForPost, keysAreEqual, keyToString } from '../post-key';

// What `/read/saved` returns for a page saved by URL and for a deleted feed item.
const URL_SAVE = {
	ID: 64089,
	site_ID: 0,
	feed_ID: 0,
	is_external: true,
	URL: 'https://example.com/a-saved-page',
	global_ID: 'url-save-global-id',
};
const PRUNED_FEED_ITEM = {
	ID: 64089,
	feed_item_ID: 64089,
	site_ID: 0,
	feed_ID: 0,
	is_external: true,
	URL: 'https://example.com/a-deleted-feed-item',
	global_ID: 'pruned-global-id',
};

describe( 'isSavedSnapshotPost', () => {
	it( 'matches external posts with no site or feed', () => {
		expect( isSavedSnapshotPost( URL_SAVE ) ).toBe( true );
		expect( isSavedSnapshotPost( PRUNED_FEED_ITEM ) ).toBe( true );
	} );

	it( 'does not match Reader posts', () => {
		expect( isSavedSnapshotPost( { ID: 1, site_ID: 100, feed_ID: 0 } ) ).toBe( false );
		expect(
			isSavedSnapshotPost( { ID: 9, feed_item_ID: 9, site_ID: 60, feed_ID: 60, is_external: true } )
		).toBe( false );
		expect( isSavedSnapshotPost( { ID: 9, is_external: true } ) ).toBe( false );
		expect( isSavedSnapshotPost( null ) ).toBe( false );
	} );
} );

describe( 'keyForPost', () => {
	it( 'keys a snapshot by its global ID and keeps its URL', () => {
		expect( keyForPost( URL_SAVE ) ).toEqual( {
			snapshotId: 'url-save-global-id',
			url: 'https://example.com/a-saved-page',
		} );
	} );

	it( 'falls back to the URL for a snapshot without a global ID', () => {
		expect( keyForPost( { ...URL_SAVE, global_ID: undefined } ).snapshotId ).toBe(
			'https://example.com/a-saved-page'
		);
	} );

	it( 'still keys RSS and WordPress.com posts by their IDs', () => {
		expect(
			keyForPost( { ID: 9, feed_item_ID: 9, site_ID: 60, feed_ID: 60, is_external: true } )
		).toEqual( { feedId: 60, postId: 9 } );
		expect( keyForPost( { ID: 1, site_ID: 100 } ) ).toEqual( { blogId: 100, postId: 1 } );
	} );
} );

describe( 'keyToString', () => {
	it( 'gives snapshots that share an ID different strings', () => {
		const urlSave = keyToString( keyForPost( URL_SAVE ) );
		const prunedFeedItem = keyToString( keyForPost( PRUNED_FEED_ITEM ) );

		expect( urlSave ).toBe( 'snapshot-url-save-global-id' );
		expect( prunedFeedItem ).toBe( 'snapshot-pruned-global-id' );
	} );
} );

describe( 'keysAreEqual', () => {
	it( 'compares snapshot keys by snapshot ID only', () => {
		const urlSave = keyForPost( URL_SAVE );

		expect( keysAreEqual( urlSave, { ...urlSave } ) ).toBe( true );
		expect( keysAreEqual( urlSave, keyForPost( PRUNED_FEED_ITEM ) ) ).toBe( false );
		expect( keysAreEqual( urlSave, { blogId: undefined, postId: undefined } ) ).toBe( false );
	} );
} );
