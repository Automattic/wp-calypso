/**
 * @jest-environment jsdom
 */

import { parseHtmlMessage } from '../html-message';

describe( 'parseHtmlMessage', () => {
	test( 'returns plain text unchanged', () => {
		expect( parseHtmlMessage( 'Sorry, that site address is unavailable.' ) ).toEqual( {
			text: 'Sorry, that site address is unavailable.',
		} );
	} );

	test( 'strips markup and lifts the first link into an action', () => {
		const html =
			'Oops! Sorry an error has occurred. Please <a href="https://wordpress.com/error-report/?url=496@example.wordpress.com">click here to contact us</a> so that we can fix it.';

		expect( parseHtmlMessage( html ) ).toEqual( {
			text: 'Oops! Sorry an error has occurred. Please click here to contact us so that we can fix it.',
			link: {
				label: 'click here to contact us',
				url: 'https://wordpress.com/error-report/?url=496@example.wordpress.com',
			},
		} );
	} );

	test( 'decodes entities and collapses whitespace', () => {
		expect( parseHtmlMessage( 'Tom &amp; Jerry\n\n  <strong>rule</strong>' ) ).toEqual( {
			text: 'Tom & Jerry rule',
		} );
	} );

	test( 'ignores links without an href', () => {
		expect( parseHtmlMessage( 'See <a>this</a>' ) ).toEqual( { text: 'See this' } );
	} );
} );
