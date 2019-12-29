/**
 * Internal dependencies
 */
import getEmbed from 'state/selectors/get-embed';

describe( 'getEmbed()', () => {
	const siteId = 12345678;
	const url = 'https://www.facebook.com/20531316728/posts/10154009990506729/';
	const embed = {
		body: 'something',
		scripts: { foo: 'bar' },
		styles: {},
	};
	const state = {
		embeds: {
			urlItems: {
				[ siteId ]: {
					[ url ]: embed,
				},
			},
		},
	};

	test( 'should return null if the site is unknown', () => {
		expect( getEmbed( state, 123, url ) ).toBeNull();
	} );

	test( 'should return null if the URL is unknown', () => {
		expect( getEmbed( state, 123, 'something' ) ).toBeNull();
	} );

	test( 'should return the embed if it exists for that site and URL', () => {
		expect( getEmbed( state, siteId, url ) ).toEqual( embed );
	} );
} );
