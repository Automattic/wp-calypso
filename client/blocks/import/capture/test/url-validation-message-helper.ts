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

	it.each( [
		[ 'email', /email address/ ],
		[ 'idn', /internationalized domain name/ ],
		[ 'invalid_characters', /invalid characters/ ],
		[ 'missing_tld', /domain extension/ ],
		[ 'invalid_protocol', /start with http:\/\/ or https:\/\// ],
		[ 'invalid_url', /valid website address/ ],
	] as const )( 'explains %s', ( reason, message ) => {
		expect( getValidationMessage( reason, translate ) ).toMatch( message );
	} );
} );
