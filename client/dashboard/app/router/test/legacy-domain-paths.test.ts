import { resolveLegacyDomainPath } from '../legacy-domain-paths';

describe( 'resolveLegacyDomainPath', () => {
	test.each( [
		// The list itself, and the paths that only ever led back to it.
		[ '', '/domains' ],
		[ 'all', '/domains' ],
		[ 'all/overview', '/domains' ],
		[ 'select-site', '/domains' ],
		[ 'select-site/example.wordpress.com', '/domains' ],
		[ 'edit', '/domains' ],
		[ 'edit/example.wordpress.com', '/domains' ],
		[ 'all/edit-selected-contact-info', '/domains' ],
		[ 'edit-selected-contact-info/example.wordpress.com', '/domains' ],

		// A lone segment is a site slug.
		[ 'example.wordpress.com', '/sites/example.wordpress.com/domains' ],

		// `<domain>/<slug>/<site>`.
		[ 'example.com/edit/example.wordpress.com', '/domains/example.com' ],
		[ 'example.com/dns/example.wordpress.com', '/domains/example.com/dns' ],
		[ 'example.com/add-dns-record/example.wordpress.com', '/domains/example.com/dns/add' ],
		[ 'example.com/edit-dns-record/example.wordpress.com', '/domains/example.com/dns/edit' ],
		[ 'example.com/edit-contact-info/example.wordpress.com', '/domains/example.com/contact-info' ],
		[ 'example.com/security/example.wordpress.com', '/domains/example.com/security' ],
		[
			'example.com/domain-connect-mapping/example.wordpress.com',
			'/domains/example.com/domain-connection-setup',
		],
		[ 'example.com/transfer/example.wordpress.com', '/domains/example.com/transfer' ],
		[ 'example.com/transfer/out/example.wordpress.com', '/domains/example.com/transfer' ],
		[
			'example.com/transfer/in/example.wordpress.com',
			'/domains/example.com/domain-transfer-setup',
		],
		[
			'example.com/transfer/precheck/example.wordpress.com',
			'/domains/example.com/domain-transfer-setup',
		],
		[
			'example.com/transfer/any-user/example.wordpress.com',
			'/domains/example.com/transfer/any-user',
		],
		[
			'example.com/transfer/other-user/example.wordpress.com',
			'/domains/example.com/transfer/other-user',
		],
		[
			'example.com/transfer/other-site/example.wordpress.com',
			'/domains/example.com/transfer/other-site',
		],
		[ 'example.com/email/example.wordpress.com', '/emails/choose-email-solution/example.com' ],

		// The `all/` counterpart of the same pages.
		[ 'all/example.com/dns/example.wordpress.com', '/domains/example.com/dns' ],
		[ 'all/overview/example.com/example.wordpress.com', '/domains/example.com' ],
		[ 'all/overview/example.com/dns/example.wordpress.com', '/domains/example.com/dns' ],
		[ 'all/overview/example.com/dns/add/example.wordpress.com', '/domains/example.com/dns/add' ],
		[ 'all/overview/example.com/dns/edit/example.wordpress.com', '/domains/example.com/dns/edit' ],
		[
			'all/overview/example.com/transfer/other-site/example.wordpress.com',
			'/domains/example.com/transfer/other-site',
		],
		[
			'all/contact-info/edit/example.com/example.wordpress.com',
			'/domains/example.com/contact-info',
		],
		[ 'all/email/example.com/example.wordpress.com', '/emails/choose-email-solution/example.com' ],

		// Unrecognized shapes fall back to the list rather than guessing.
		[ 'example.com/not-a-real-slug/example.wordpress.com', '/domains' ],
		[ 'all/overview/example.com/not-a-real-slug/example.wordpress.com', '/domains' ],
	] )( '/domains/manage/%s → %s', ( splat, expected ) => {
		expect( resolveLegacyDomainPath( splat ) ).toBe( expected );
	} );

	test( 'decodes the domain, which legacy paths encode twice', () => {
		expect( resolveLegacyDomainPath( 'example.com%2Fpath/edit/example.wordpress.com' ) ).toBe(
			'/domains/example.com%2Fpath'
		);
	} );
} );
