/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Gravatar } from '../';

describe( 'Gravatar', () => {
	/**
	 * Gravatar URLs use email hashes
	 * Here we're hashing MyEmailAddress@example.com
	 *
	 * @see https://en.gravatar.com/site/implement/hash/
	 */
	const gravatarHash = 'f9879d71855b5ff21e4963273a886bfc';

	const avatarUrl = `https://0.gravatar.com/avatar/${ gravatarHash }?s=96&d=mm`;

	const genericUser = {
		avatar_URL: avatarUrl,
		display_name: 'Bob The Tester',
	};

	describe( 'rendering', () => {
		test( 'should render an image given a user with valid avatar_URL, with default width and height 32', () => {
			const { container } = render( <Gravatar user={ genericUser } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( avatarUrl );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob The Tester' );
		} );

		test( 'should update the width and height when given a size attribute', () => {
			const { container } = render( <Gravatar user={ genericUser } size={ 100 } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( avatarUrl );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '100' );
			expect( img.getAttribute( 'height' ) ).toEqual( '100' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob The Tester' );
		} );

		test( 'should update source image when given imgSize attribute', () => {
			const { container } = render( <Gravatar user={ genericUser } imgSize={ 200 } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual(
				`https://0.gravatar.com/avatar/${ gravatarHash }?s=200&d=mm`
			);
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob The Tester' );
		} );

		test( 'should serve a default image if no avatar_URL available', () => {
			const noImageUser = { display_name: 'Bob The Tester' };
			const { container } = render( <Gravatar user={ noImageUser } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( 'https://www.gravatar.com/avatar/0?s=96&d=mm' );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob The Tester' );
		} );

		test( 'should also pick up the default alt from the name prop', () => {
			const userFromSiteApi = {
				avatar_URL: avatarUrl,
				name: 'Bob The Tester',
			};
			const { container } = render( <Gravatar user={ userFromSiteApi } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( avatarUrl );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob The Tester' );
		} );

		test( 'should prefer display_name for the alt', () => {
			const userFromSiteApi = {
				avatar_URL: avatarUrl,
				name: 'Bob The Tester',
				display_name: 'Bob',
			};
			const { container } = render( <Gravatar user={ userFromSiteApi } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( avatarUrl );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Bob' );
		} );

		test( 'should allow overriding the alt attribute', () => {
			const { container } = render( <Gravatar user={ genericUser } alt="Another Alt" /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual( avatarUrl );
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
			expect( img.getAttribute( 'alt' ) ).toEqual( 'Another Alt' );
		} );

		// I believe jetpack sites could have custom avatars, so can't assume it's always a gravatar
		test( 'should promote non-secure avatar urls to secure', () => {
			const nonSecureUrlUser = { avatar_URL: 'http://www.example.com/avatar' };
			const { container } = render( <Gravatar user={ nonSecureUrlUser } /> );
			const img = container.getElementsByTagName( 'img' )[ 0 ];

			expect( img ).toBeDefined();
			expect( img.getAttribute( 'src' ) ).toEqual(
				'https://i0.wp.com/www.example.com/avatar?resize=96%2C96'
			);
			expect( img ).toHaveClass( 'gravatar' );
			expect( img.getAttribute( 'width' ) ).toEqual( '32' );
			expect( img.getAttribute( 'height' ) ).toEqual( '32' );
		} );

		describe( 'when Gravatar fails to load', () => {
			test( 'should render a span element', () => {
				const { container } = render( <Gravatar user={ genericUser } /> );

				// simulate the Gravatar not loading
				const img = container.getElementsByTagName( 'img' )[ 0 ];
				fireEvent.error( img );

				const span = container.getElementsByTagName( 'span' )[ 0 ];

				expect( img ).toBeDefined();
				expect( span ).toBeDefined();
				expect( span ).toHaveClass( 'is-missing' );
			} );

			test( 'should show temp image if it exists', () => {
				const { container } = render( <Gravatar tempImage="tempImage" user={ genericUser } /> );

				// simulate the Gravatar not loading
				const img = container.getElementsByTagName( 'img' )[ 0 ];
				fireEvent.error( img );

				const span = container.getElementsByTagName( 'span' )[ 0 ];

				expect( img ).toBeDefined();
				expect( span ).toBeUndefined();
				expect( img.getAttribute( 'src' ) ).toEqual( 'tempImage' );
				expect( img ).toHaveClass( 'gravatar' );
			} );
		} );
	} );
} );
