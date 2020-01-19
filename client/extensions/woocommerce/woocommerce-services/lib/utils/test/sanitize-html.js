/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import dompurify from 'dompurify';

/**
 * Internal dependencies
 */
import sanitizeHtml, { ALLOWED_TAGS, ALLOWED_ATTR } from '../sanitize-html';

describe( 'sanitizeHtml', () => {
	const html = `<html><body><a href="#" malformed="attribute">Link</a></body></html>`;

	test( 'should remove any html tags and attributes which are not allowed', () => {
		expect( sanitizeHtml( html ) ).toEqual( {
			__html: '<a href="#">Link</a>',
		} );
	} );

	test( 'should call dompurify.sanitize with list of allowed tags and attributes', () => {
		const sanitizeMock = jest.spyOn( dompurify, 'sanitize' );

		sanitizeHtml( html );
		expect( sanitizeMock ).toHaveBeenCalledWith( html, { ALLOWED_ATTR, ALLOWED_TAGS } );
	} );
} );
