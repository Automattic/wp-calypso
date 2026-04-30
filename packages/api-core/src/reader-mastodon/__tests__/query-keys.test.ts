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
