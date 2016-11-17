/**
 * External dependencies
 */
import assert from 'assert';
import ReactDomServer from 'react-dom/server';
import React from 'react';

/**
 * Internal dependencies
 */
import { Gravatar } from '../';

/**
 * Pass in a react-generated html string to remove react-specific attributes
 * to make it easier to compare to expected html structure
 * @param {string} string react-generated html
 * @return {string} HTML without react attributes
 */
function stripReactAttributes( string ) {
	return string.replace( /\sdata\-(reactid|react\-checksum)\=\"[^\"]+\"/g, '' );
}

describe( 'Gravatar', function() {
	const bobTester = {
		avatar_URL: 'https://0.gravatar.com/avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&d=identicon',
		display_name: 'Bob The Tester'
	};

	describe( 'rendering', function() {
		it( 'should render an image given a user with valid avatar_URL, with default width and height 32', function() {
			const gravatar = <Gravatar user={ bobTester } />;
			const expectedResultString = '<img alt="Bob The Tester" ' +
				'class="gravatar" ' +
				'src="https://0.gravatar.com/' +
				'avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&amp;d=mm" ' +
				'width="32" height="32"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );

		it( 'should update the width and height when given a size attribute', function() {
			const gravatar = <Gravatar user={ bobTester } size={ 100 } />;
			const expectedResultString = '<img alt="Bob The Tester" ' +
				'class="gravatar" ' +
				'src="https://0.gravatar.com/' +
				'avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&amp;d=mm" ' +
				'width="100" height="100"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );

		it( 'should update source image when given imgSize attribute', function() {
			const gravatar = <Gravatar user={ bobTester } imgSize={ 200 } />;
			const expectedResultString = '<img alt="Bob The Tester" ' +
				'class="gravatar" ' +
				'src="https://0.gravatar.com/' +
				'avatar/cf55adb1a5146c0a11a808bce7842f7b?s=200&amp;d=mm" ' +
				'width="32" height="32"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );

		it( 'should serve a default image if no avatar_URL available', function() {
			const noImageTester = { display_name: 'Bob The Tester' };
			const gravatar = <Gravatar user={ noImageTester } />;
			const expectedResultString = '<img alt="Bob The Tester" ' +
				'class="gravatar" ' +
				'src="https://www.gravatar.com/avatar/0?s=96&amp;d=mm" ' +
				'width="32" height="32"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );

		it( 'should allow overriding the alt attribute', function() {
			const gravatar = <Gravatar user={ bobTester } alt="Alternate Alt" />;
			const expectedResultString = '<img alt="Alternate Alt" ' +
				'class="gravatar" ' +
				'src="https://0.gravatar.com/' +
				'avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&amp;d=mm" ' +
				'width="32" height="32"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );

		// I believe jetpack sites could have custom avatars, so can't assume it's always a gravatar
		it( 'should promote non-secure avatar urls to secure', function() {
			const nonSecureTester = { avatar_URL: 'http://www.example.com/avatar' };
			const gravatar = <Gravatar user={ nonSecureTester } />;
			const expectedResultString = '<img class="gravatar" ' +
				'src="https://i2.wp.com/www.example.com/avatar?resize=96%2C96" ' +
				'width="32" height="32"/>';

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToStaticMarkup( gravatar ) ) );
		} );
	} );
} );
