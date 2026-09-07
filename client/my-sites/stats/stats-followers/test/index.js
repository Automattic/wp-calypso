import { getNewsletterSubscriberDetailUrl } from '../index';

describe( 'getNewsletterSubscriberDetailUrl()', () => {
	const adminPhpUrl = 'https://example.com/wp-admin/admin.php';

	test( 'nests the subscriber and user ids in the encoded `p` route param', () => {
		expect( getNewsletterSubscriberDetailUrl( adminPhpUrl, 944012532, 266514373 ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-newsletter&p=%2F%3Fsubscriber%3D944012532%26u%3D266514373'
		);
	} );

	test( 'omits the `u` param for email-only subscribers with no user id', () => {
		expect( getNewsletterSubscriberDetailUrl( adminPhpUrl, 944012532 ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-newsletter&p=%2F%3Fsubscriber%3D944012532'
		);
	} );
} );
