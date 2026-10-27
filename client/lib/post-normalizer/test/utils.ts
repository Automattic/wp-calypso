import { isFeaturedImageInContent, makeImageURLSafe } from '../utils';

describe( 'isFeaturedImageInContent', () => {
	test( 'should detect identical urls', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).toEqual( 1 );
	} );

	test( 'should return false when no images', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [],
		};
		expect( isFeaturedImageInContent( post ) ).toBe( false );
	} );

	test( 'should return false when image is not in content', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/one.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).toBe( false );
	} );

	test( 'should ignore hostname when comparing', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://example2.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).toEqual( 1 );
	} );

	test( 'should understand photon urls embed the hostname when comparing', () => {
		const post = {
			post_thumbnail: {
				URL: 'http://i0.wp.com/example2.com/image.jpg',
			},
			images: [ { src: 'http://example.com/image.jpg' }, { src: 'http://example.com/image.jpg' } ],
		};
		expect( isFeaturedImageInContent( post ) ).toEqual( 1 );
	} );

	test( 'should match resized and scaled copies of the featured image', () => {
		const post = {
			post_thumbnail: {
				URL: 'https://example.com/wp-content/uploads/2026/09/3.jpg',
			},
			images: [
				{ src: 'https://example.com/wp-content/uploads/2026/09/3.jpg' },
				{ src: 'https://example.com/wp-content/uploads/2026/09/16-771x1024.jpg' },
				{ src: 'https://example.com/wp-content/uploads/2026/09/3-scaled-771x1024.jpg' },
			],
		};
		expect( isFeaturedImageInContent( post ) ).toEqual( 2 );
	} );

	test( 'should not treat a different image with a size-like name as a match', () => {
		const post = {
			post_thumbnail: {
				URL: 'https://example.com/wp-content/uploads/2026/09/3.jpg',
			},
			images: [
				{ src: 'https://example.com/wp-content/uploads/2026/09/3.jpg' },
				{ src: 'https://example.com/wp-content/uploads/2026/09/3-2.jpg' },
				{ src: 'https://example.com/wp-content/uploads/2026/09/300x200.jpg' },
			],
		};
		expect( isFeaturedImageInContent( post ) ).toBe( false );
	} );
} );

describe( 'makeImageURLSafe', () => {
	describe( 'with a relative path resource', () => {
		test( 'works when `baseUrl` is not specified', () => {
			const obj = { src: '/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src' );
			expect( obj.src ).toEqual( '/foo/bar.jpg' );
		} );

		test( 'works when `baseUrl` is specified as a URL object', () => {
			const obj = { src: '/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', null, new URL( 'http://example.com/' ) );
			expect( obj.src ).toEqual( 'https://i0.wp.com/example.com/foo/bar.jpg' );
		} );

		test( 'works when `baseUrl` is specified as a URL string', () => {
			const obj = { src: '/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', null, 'http://example.com/' );
			expect( obj.src ).toEqual( 'https://i0.wp.com/example.com/foo/bar.jpg' );
		} );

		test( 'correctly limits the image size when `maxWidth` is specified', () => {
			const obj = { src: '/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', 100, 'http://example.com/' );
			expect( obj.src ).toEqual(
				'https://i0.wp.com/example.com/foo/bar.jpg?quality=80&strip=info&w=100'
			);
		} );
	} );

	describe( 'with an absolute path resource', () => {
		test( 'works when `baseUrl` is not specified', () => {
			const obj = { src: 'http://example.org/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src' );
			expect( obj.src ).toEqual( 'https://i0.wp.com/example.org/foo/bar.jpg' );
		} );

		test( 'works when `baseUrl` is specified as a URL object', () => {
			const obj = { src: 'http://example.org/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', null, new URL( 'http://example.com/' ) );
			expect( obj.src ).toEqual( 'https://i0.wp.com/example.org/foo/bar.jpg' );
		} );

		test( 'works when `baseUrl` is specified as a URL string', () => {
			const obj = { src: 'http://example.org/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', null, 'http://example.com/' );
			expect( obj.src ).toEqual( 'https://i0.wp.com/example.org/foo/bar.jpg' );
		} );

		test( 'correctly limits the image size when `maxWidth` is specified', () => {
			const obj = { src: 'http://example.org/foo/bar.jpg' };
			makeImageURLSafe( obj, 'src', 100, 'http://example.com/' );
			expect( obj.src ).toEqual(
				'https://i0.wp.com/example.org/foo/bar.jpg?quality=80&strip=info&w=100'
			);
		} );
	} );
} );
