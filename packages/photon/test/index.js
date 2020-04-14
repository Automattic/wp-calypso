/* eslint jest/expect-expect: [ "error", { "assertFunctionNames": [ "expect", "expectPathname", "expectQuery", "expectHostedOnPhoton", "expectHostedOnPhotonInsecurely" ] } ] */

/**
 * Internal dependencies
 */
import photon from '../src';

function expectHostedOnPhoton( url ) {
	expect( url ).toEqual( expect.stringMatching( /^https:\/\/i[0-2].wp.com/ ) );
}

function expectHostedOnPhotonInsecurely( url ) {
	expect( url ).toEqual( expect.stringMatching( /^http:\/\/i[0-2].wp.com/ ) );
}

function expectPathname( url, expected ) {
	const parsedUrl = new URL( url );
	expect( parsedUrl.pathname ).toBe( expected );
}

function expectQuery( url, expected ) {
	const searchParams = new URL( url ).searchParams;
	for ( const key of Object.keys( expected ) ) {
		expect( searchParams.get( key ) ).toBe( expected[ key ] );
	}
}

describe( 'photon()', function () {
	test( 'should be a "function"', function () {
		expect( photon ).toBeInstanceOf( Function );
	} );

	test( 'should Photon-ify a basic image URL', function () {
		const url = 'http://example.com/image.png';

		expect( photon( url ) ).toEqual(
			expect.stringMatching( /^https:\/\/i[0-2].wp.com\/example.com\/image.png$/ )
		);
	} );

	test( 'should Photon-ify a secure image URL', function () {
		const url = 'https://example.com/image.png';
		expect( photon( url ) ).toEqual(
			expect.stringMatching( /^https:\/\/i[0-2].wp.com\/example.com\/image.png\?ssl=1$/ )
		);
	} );

	test( 'should not Photon-ify an existing Photon URL, even if the host is wrong', function () {
		const photonedUrl = photon( 'http://www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc' );
		const alternateUrl =
			'https://i1.wp.com/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc';

		expectHostedOnPhoton( photonedUrl );
		expect( photonedUrl ).not.toBe( alternateUrl );
		expect( photon( alternateUrl ) ).toBe( alternateUrl );
	} );

	test( 'should handle photoning a photoned url', function () {
		const url = photon( 'http://example.com/image.png' );
		expect( photon( url ) ).toBe( url );
	} );

	test( 'should add width parameters if specified', function () {
		const photonedUrl = photon( 'http://example.com/image.png', { width: 50 } );

		expectQuery( photonedUrl, { w: '50' } );
	} );

	test( 'should return null for URLs with querystrings from non-photon hosts', function () {
		const url = 'http://example.com/image.png?foo=bar';

		expect( photon( url ) ).toBeNull();
	} );

	test( 'should handle protocolless URLs', function () {
		const url = '//example.com/image.png';
		const photonedUrl = photon( url );

		expectHostedOnPhoton( photonedUrl );
		expectPathname( photonedUrl, '/example.com/image.png' );
	} );

	test( 'should handle blob: URLs', function () {
		const url = 'blob:http://example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
		const photonedUrl = photon( url );

		expectHostedOnPhoton( photonedUrl );
		expectPathname( photonedUrl, '/http//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71' );
	} );

	test( 'should strip existing size params from photoned URLs', function () {
		const url =
			'https://i0.wp.com/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc?resize=120';
		const photonedUrl = photon( url, { width: 150, height: 300 } );

		expectHostedOnPhoton( photonedUrl );
		expectPathname( photonedUrl, '/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc' );
		expectQuery( photonedUrl, { w: '150', h: '300' } );
	} );

	test( 'should allow you to do everything at once', function () {
		const url = 'https://i0.wp.com/example.com/foo.png?w=50&lb=10&unknown=true';
		const photonedUrl = photon( url, {
			width: 10,
			height: 20,
			letterboxing: '120,120',
			removeLetterboxing: true,
		} );

		expectHostedOnPhoton( photonedUrl );
		expectPathname( photonedUrl, '/example.com/foo.png' );
		expectQuery( photonedUrl, { w: '10', h: '20', lb: '120,120', ulb: 'true' } );
	} );

	test( 'should allow you to turn off https', function () {
		let photonedUrl = photon( 'http://example.com/foo.png', { secure: false } );

		expectHostedOnPhotonInsecurely( photonedUrl );

		photonedUrl = photon( 'https://i0.wp.com/example.com/foo.png', { secure: false } );

		expectHostedOnPhotonInsecurely( photonedUrl );
	} );

	test( 'should allow you to turn off ssl for fetching', function () {
		let photonedUrl = photon( 'https://example.com/foo.png', { secure: false, ssl: '0' } );

		expectHostedOnPhotonInsecurely( photonedUrl );
		expectQuery( photonedUrl, { ssl: '0' } );

		photonedUrl = photon( 'https://i0.wp.com/example.com/foo.png', { secure: false, ssl: '0' } );

		expectHostedOnPhotonInsecurely( photonedUrl );
		expectQuery( photonedUrl, { ssl: '0' } );
	} );
} );
