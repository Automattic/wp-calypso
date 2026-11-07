import { getUrlValidationError, getValidationMessage } from '../url-validation-message-helper';

describe( 'getUrlValidationError', () => {
	it.each( [
		'example.com',
		'https://www.example.com',
		'example.wordpress.com/blog',
		'medium.com/@john.doe',
		'https://example.wordpress.com/wp-admin/',
		'mywordpress.com',
		'wordpress.community',
		'wordpress.com.au',
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
		[ 'wordpress.com/log-in', 'wordpress_com_page' ],
		[ 'https://wordpress.com/home/example.com', 'wordpress_com_page' ],
		[ 'WordPress.com', 'wordpress_com_page' ],
		[ 'https://www.wordpress.com/setup/site-migration', 'wordpress_com_page' ],
		[ 'wordpress.com:443/log-in', 'wordpress_com_page' ],
		[ 'http://public-api.wordpress.com/wp-json/', 'wordpress_com_page' ],
		[ 'wp.com', 'wordpress_com_page' ],
		[ 'www.wp.com/log-in', 'wordpress_com_page' ],
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
		[ 'wordpress_com_page', /WordPress\.com page, not your site/ ],
	] as const )( 'explains %s', ( reason, message ) => {
		expect( getValidationMessage( reason, translate ) ).toMatch( message );
	} );
} );
