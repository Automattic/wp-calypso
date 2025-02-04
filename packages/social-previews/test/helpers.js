/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { preparePreviewText } from '../src/helpers';

const platformsWithHyperlinkUrls = [ 'facebook', 'linkedin', 'twitter' ];

const platformsWithoutHyperlinkUrls = [ 'instagram' ];

const allPlatforms = [ ...platformsWithHyperlinkUrls, ...platformsWithoutHyperlinkUrls ];

describe( 'preparePreviewText', () => {
	it( 'should do nothing if there are no hashtags, URLs or new lines', () => {
		const text = `Some text here which has no URL, no hashtag and no line break`;

		for ( const platform of allPlatforms ) {
			const { container } = render( preparePreviewText( text, { platform } ) );

			expect( container.innerHTML ).toBe(
				'Some text here which has no URL, no hashtag and no line break'
			);

			expect( render( preparePreviewText( '', { platform } ) ).container.innerHTML ).toBe( '' );
		}
	} );

	it( 'should convert new lines to `<br /> tags', () => {
		const text = `Some text with a \n here and another one here\n That is it.`;

		for ( const platform of allPlatforms ) {
			const { container } = render( preparePreviewText( text, { platform } ) );

			expect( container.innerHTML ).toBe(
				'Some text with a <br> here and another one here<br> That is it.'
			);
		}
	} );

	it( 'should limit the text to the given number of lines', () => {
		const text = `This is the first line\nThis is the second line\nthis third and\this 4th`;

		for ( const platform of allPlatforms ) {
			const { container } = render( preparePreviewText( text, { platform, maxLines: 2 } ) );

			expect( container.innerHTML ).toBe( 'This is the first line<br>This is the second line' );
		}
	} );

	it( 'should limit the text to the given number of characters', () => {
		const text = `This is the first line\nThis is the second line\nthis third and\this 4th`;

		for ( const platform of allPlatforms ) {
			const { container } = render( preparePreviewText( text, { platform, maxChars: 60 } ) );

			expect( container.innerHTML ).toBe(
				'This is the first line<br>This is the second line<br>this third an…'
			);
		}
	} );

	it( "should convert URLs to hyperlinks by default except for the platforms that don't support it", () => {
		const text = `Check out this cool site: https://wordpress.org and this one https://wordpress.com also.`;

		for ( const platform of platformsWithHyperlinkUrls ) {
			const { container } = render( preparePreviewText( text, { platform } ) );

			expect( container.innerHTML ).toBe(
				'Check out this cool site: <a href="https://wordpress.org" rel="noopener noreferrer" target="_blank">https://wordpress.org</a> and this one <a href="https://wordpress.com" rel="noopener noreferrer" target="_blank">https://wordpress.com</a> also.'
			);
		}

		for ( const platform of platformsWithoutHyperlinkUrls ) {
			const { container } = render( preparePreviewText( text, { platform } ) );

			expect( container.innerHTML ).toBe(
				'Check out this cool site: https://wordpress.org and this one https://wordpress.com also.'
			);
		}
	} );

	it( 'should NOT convert URLs to hyperlinks when `hyperlinkUrls` is `false`', () => {
		const text = `Check out this cool site: https://wordpress.org and this one https://wordpress.com also.`;

		for ( const platform of allPlatforms ) {
			const { container } = render(
				preparePreviewText( text, { platform, hyperlinkUrls: false } )
			);

			expect( container.innerHTML ).toBe(
				'Check out this cool site: https://wordpress.org and this one https://wordpress.com also.'
			);
		}
	} );

	it( 'should convert hashtags to hyperlinks by default', () => {
		const text = `#breaking text with a #hashtag on the #web\nwith a url https://github.com/Automattic/wp-calypso#security that has a hash in it\n#thisone after a new line`;

		expect(
			render( preparePreviewText( text, { platform: 'facebook' } ) ).container.innerHTML
		).toBe(
			'<a href="https://www.facebook.com/hashtag/breaking" rel="noopener noreferrer" target="_blank">#breaking</a> text with a <a href="https://www.facebook.com/hashtag/hashtag" rel="noopener noreferrer" target="_blank">#hashtag</a> on the <a href="https://www.facebook.com/hashtag/web" rel="noopener noreferrer" target="_blank">#web</a><br>with a url <a href="https://github.com/Automattic/wp-calypso#security" rel="noopener noreferrer" target="_blank">https://github.com/Automattic/wp-calypso#security</a> that has a hash in it<br><a href="https://www.facebook.com/hashtag/thisone" rel="noopener noreferrer" target="_blank">#thisone</a> after a new line'
		);

		expect(
			render( preparePreviewText( text, { platform: 'instagram' } ) ).container.innerHTML
		).toBe(
			'<a href="https://www.instagram.com/explore/tags/breaking" rel="noopener noreferrer" target="_blank">#breaking</a> text with a <a href="https://www.instagram.com/explore/tags/hashtag" rel="noopener noreferrer" target="_blank">#hashtag</a> on the <a href="https://www.instagram.com/explore/tags/web" rel="noopener noreferrer" target="_blank">#web</a><br>with a url https://github.com/Automattic/wp-calypso#security that has a hash in it<br><a href="https://www.instagram.com/explore/tags/thisone" rel="noopener noreferrer" target="_blank">#thisone</a> after a new line'
		);

		expect(
			render( preparePreviewText( text, { platform: 'linkedin' } ) ).container.innerHTML
		).toBe(
			'<a href="https://www.linkedin.com/feed/hashtag/?keywords=breaking" rel="noopener noreferrer" target="_blank">#breaking</a> text with a <a href="https://www.linkedin.com/feed/hashtag/?keywords=hashtag" rel="noopener noreferrer" target="_blank">#hashtag</a> on the <a href="https://www.linkedin.com/feed/hashtag/?keywords=web" rel="noopener noreferrer" target="_blank">#web</a><br>with a url <a href="https://github.com/Automattic/wp-calypso#security" rel="noopener noreferrer" target="_blank">https://github.com/Automattic/wp-calypso#security</a> that has a hash in it<br><a href="https://www.linkedin.com/feed/hashtag/?keywords=thisone" rel="noopener noreferrer" target="_blank">#thisone</a> after a new line'
		);

		expect(
			render( preparePreviewText( text, { platform: 'twitter' } ) ).container.innerHTML
		).toBe(
			'<a href="https://twitter.com/hashtag/breaking" rel="noopener noreferrer" target="_blank">#breaking</a> text with a <a href="https://twitter.com/hashtag/hashtag" rel="noopener noreferrer" target="_blank">#hashtag</a> on the <a href="https://twitter.com/hashtag/web" rel="noopener noreferrer" target="_blank">#web</a><br>with a url <a href="https://github.com/Automattic/wp-calypso#security" rel="noopener noreferrer" target="_blank">https://github.com/Automattic/wp-calypso#security</a> that has a hash in it<br><a href="https://twitter.com/hashtag/thisone" rel="noopener noreferrer" target="_blank">#thisone</a> after a new line'
		);
	} );

	it( 'should NOT convert hashtags to hyperlinks when `hyperlinkHashtags` is `false`', () => {
		const text = `#breaking text with a #hashtag on the #web\nwith a url https://github.com/Automattic/wp-calypso#security that has a hash in it\n#thisone after a new line`;

		for ( const platform of platformsWithHyperlinkUrls ) {
			const { container } = render(
				preparePreviewText( text, { platform, hyperlinkHashtags: false } )
			);

			expect( container.innerHTML ).toBe(
				'#breaking text with a #hashtag on the #web<br>with a url <a href="https://github.com/Automattic/wp-calypso#security" rel="noopener noreferrer" target="_blank">https://github.com/Automattic/wp-calypso#security</a> that has a hash in it<br>#thisone after a new line'
			);
		}

		for ( const platform of platformsWithoutHyperlinkUrls ) {
			const { container } = render(
				preparePreviewText( text, { platform, hyperlinkHashtags: false } )
			);

			expect( container.innerHTML ).toBe(
				'#breaking text with a #hashtag on the #web<br>with a url https://github.com/Automattic/wp-calypso#security that has a hash in it<br>#thisone after a new line'
			);
		}
	} );
} );
