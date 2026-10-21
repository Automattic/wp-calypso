import { readerMastodonKeys } from '../query-keys';

describe( 'readerMastodonKeys', () => {
	it( 'stable keys', () => {
		expect( readerMastodonKeys.all ).toEqual( [ 'reader', 'mastodon' ] );
		expect( readerMastodonKeys.connections() ).toEqual( [ 'reader', 'mastodon', 'connections' ] );
		expect( readerMastodonKeys.connection( 42 ) ).toEqual( [
			'reader',
			'mastodon',
			'connection',
			42,
		] );
	} );
} );

describe( 'readerMastodonKeys profile keys', () => {
	it( 'authorProfile keys by connection id and actor', () => {
		expect( readerMastodonKeys.authorProfile( 7, '108020' ) ).toEqual( [
			'reader',
			'mastodon',
			'profile',
			7,
			'108020',
		] );
	} );

	it( 'authorFeed keys by connection id and actor', () => {
		expect( readerMastodonKeys.authorFeed( 7, '108020' ) ).toEqual( [
			'reader',
			'mastodon',
			'profile-feed',
			7,
			'108020',
		] );
	} );
} );

describe( 'readerMastodonKeys.authorFeed filter dimension', () => {
	it( 'includes the filter when set', () => {
		expect( readerMastodonKeys.authorFeed( 7, '108020', 'posts_no_replies' ) ).toEqual( [
			'reader',
			'mastodon',
			'profile-feed',
			7,
			'108020',
			'posts_no_replies',
		] );
	} );

	it( 'omits the filter slot when undefined', () => {
		expect( readerMastodonKeys.authorFeed( 7, '108020' ) ).toEqual( [
			'reader',
			'mastodon',
			'profile-feed',
			7,
			'108020',
		] );
	} );
} );

describe( 'readerMastodonKeys.tagFeed', () => {
	it( 'keys by connection id and hashtag (no filter slot)', () => {
		expect( readerMastodonKeys.tagFeed( 7, 'rust' ) ).toEqual( [
			'reader',
			'mastodon',
			'tag-feed',
			7,
			'rust',
		] );
	} );

	it( 'appends the filter when set', () => {
		expect( readerMastodonKeys.tagFeed( 7, 'rust', 'media' ) ).toEqual( [
			'reader',
			'mastodon',
			'tag-feed',
			7,
			'rust',
			'media',
		] );
	} );
} );

describe( 'readerMastodonKeys.notifications', () => {
	it( 'notifications(connectionId, "all") shapes the All-chip key', () => {
		expect( readerMastodonKeys.notifications( 42, 'all' ) ).toEqual( [
			'reader',
			'mastodon',
			'notifications',
			42,
			'all',
		] );
	} );

	it( 'notifications(connectionId, filter) includes filter in key', () => {
		expect( readerMastodonKeys.notifications( 42, 'likes' ) ).toEqual( [
			'reader',
			'mastodon',
			'notifications',
			42,
			'likes',
		] );
	} );
} );

describe( 'readerMastodonKeys.authStatus', () => {
	it( 'authStatus key includes the connection id', () => {
		expect( readerMastodonKeys.authStatus( 42 ) ).toEqual( [
			'reader',
			'mastodon',
			'auth-status',
			42,
		] );
	} );

	it( 'authStatus key with null id keeps the slot for cache parity', () => {
		expect( readerMastodonKeys.authStatus( null ) ).toEqual( [
			'reader',
			'mastodon',
			'auth-status',
			null,
		] );
	} );
} );
