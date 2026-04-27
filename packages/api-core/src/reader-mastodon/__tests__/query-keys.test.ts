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
