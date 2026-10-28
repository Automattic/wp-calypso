import { getUrlValidationError, getValidationMessage } from '../url-validation-message-helper';

describe( 'getUrlValidationError', () => {
	it.each( [
		'example.com',
		'https://www.example.com',
		'example.wordpress.com/blog',
		'medium.com/@john.doe',
	] )( 'accepts %s', ( url ) => {
		expect( getUrlValidationError( url ) ).toBeNull();
	} );

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
	] )( 'rejects %s as %s', ( url, reason ) => {
		expect( getUrlValidationError( url ) ).toBe( reason );
	} );
} );

describe( 'getValidationMessage', () => {
	const translate = ( text: string ) => text;

	it( 'returns a different message for each reason', () => {
		const messages = (
			[
				'email',
				'idn',
				'invalid_characters',
				'missing_tld',
				'invalid_protocol',
				'invalid_url',
			] as const
		 ).map( ( reason ) => getValidationMessage( reason, translate ) );

		expect( new Set( messages ).size ).toBe( messages.length );
	} );
} );
