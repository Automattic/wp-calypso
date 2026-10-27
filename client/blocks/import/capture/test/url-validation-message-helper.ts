import getValidationMessage, { getValidationErrorReason } from '../url-validation-message-helper';

describe( 'getValidationErrorReason', () => {
	it.each( [
		[ 'myblog', 'missing_tld' ],
		[ 'https://myblog', 'missing_tld' ],
		[ 'user@example.com', 'email' ],
		[ 'http://my^blog.com', 'invalid_characters' ],
		[ 'not a url', 'invalid_characters' ],
		[ 'ftp://example.com', 'invalid_protocol' ],
		[ 'file:///C:/DEVELOPER/index.html', 'invalid_protocol' ],
		[ 'https://xn--example.com', 'idn' ],
		[ 'www.例子.测试', 'idn' ],
		[ 'example.com-', 'invalid_url' ],
	] )( '%s → %s', ( url, reason ) => {
		expect( getValidationErrorReason( url ) ).toBe( reason );
	} );
} );

describe( 'getValidationMessage', () => {
	const translate = ( text: string ) => text;

	it( 'returns a different message for each reason', () => {
		const messages = [
			'myblog',
			'user@example.com',
			'http://my^blog.com',
			'ftp://example.com',
			'https://xn--example.com',
			'example.com-',
		].map( ( url ) => getValidationMessage( url, translate ) );

		expect( new Set( messages ).size ).toBe( messages.length );
	} );
} );
