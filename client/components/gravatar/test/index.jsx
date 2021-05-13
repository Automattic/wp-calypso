/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { Gravatar } from '../';

describe( 'Gravatar', () => {
	/**
	 * Gravatar URLs use email hashes
	 * Here we're hashing MyEmailAddress@example.com
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
			const gravatar = shallow( <Gravatar user={ genericUser } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( avatarUrl );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob The Tester' );
		} );

		test( 'should update the width and height when given a size attribute', () => {
			const gravatar = shallow( <Gravatar user={ genericUser } size={ 100 } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( avatarUrl );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 100 );
			expect( img.prop( 'height' ) ).to.equal( 100 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob The Tester' );
		} );

		test( 'should update source image when given imgSize attribute', () => {
			const gravatar = shallow( <Gravatar user={ genericUser } imgSize={ 200 } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal(
				`https://0.gravatar.com/avatar/${ gravatarHash }?s=200&d=mm`
			);
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob The Tester' );
		} );

		test( 'should serve a default image if no avatar_URL available', () => {
			const noImageUser = { display_name: 'Bob The Tester' };
			const gravatar = shallow( <Gravatar user={ noImageUser } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( 'https://www.gravatar.com/avatar/0?s=96&d=mm' );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob The Tester' );
		} );

		test( 'should also pick up the default alt from the name prop', () => {
			const userFromSiteApi = {
				avatar_URL: avatarUrl,
				name: 'Bob The Tester',
			};
			const gravatar = shallow( <Gravatar user={ userFromSiteApi } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( avatarUrl );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob The Tester' );
		} );

		test( 'should prefer display_name for the alt', () => {
			const userFromSiteApi = {
				avatar_URL: avatarUrl,
				name: 'Bob The Tester',
				display_name: 'Bob',
			};
			const gravatar = shallow( <Gravatar user={ userFromSiteApi } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( avatarUrl );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Bob' );
		} );

		test( 'should allow overriding the alt attribute', () => {
			const gravatar = shallow( <Gravatar user={ genericUser } alt="Another Alt" /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal( avatarUrl );
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
			expect( img.prop( 'alt' ) ).to.equal( 'Another Alt' );
		} );

		// I believe jetpack sites could have custom avatars, so can't assume it's always a gravatar
		test( 'should promote non-secure avatar urls to secure', () => {
			const nonSecureUrlUser = { avatar_URL: 'http://www.example.com/avatar' };
			const gravatar = shallow( <Gravatar user={ nonSecureUrlUser } /> );
			const img = gravatar.find( 'img' );

			expect( img.length ).to.equal( 1 );
			expect( img.prop( 'src' ) ).to.equal(
				'https://i2.wp.com/www.example.com/avatar?resize=96%2C96'
			);
			expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			expect( img.prop( 'width' ) ).to.equal( 32 );
			expect( img.prop( 'height' ) ).to.equal( 32 );
		} );

		describe( 'when Gravatar fails to load', () => {
			test( 'should render a span element', () => {
				const gravatar = shallow( <Gravatar user={ genericUser } /> );

				// simulate the Gravatar not loading
				gravatar.setState( { failedToLoad: true } );

				const img = gravatar.find( 'img' );
				const span = gravatar.find( 'span' );

				expect( img.length ).to.equal( 0 );
				expect( span.length ).to.equal( 1 );
				expect( span.hasClass( 'is-missing' ) ).to.equal( true );
			} );

			test( 'should show temp image if it exists', () => {
				const gravatar = shallow( <Gravatar tempImage={ 'tempImage' } user={ genericUser } /> );

				// simulate the Gravatar not loading
				gravatar.setState( { failedToLoad: true } );

				const img = gravatar.find( 'img' );
				const span = gravatar.find( 'span' );

				expect( img.length ).to.equal( 1 );
				expect( span.length ).to.equal( 0 );
				expect( img.prop( 'src' ) ).to.equal( 'tempImage' );
				expect( img.hasClass( 'gravatar' ) ).to.equal( true );
			} );
		} );
	} );
} );
