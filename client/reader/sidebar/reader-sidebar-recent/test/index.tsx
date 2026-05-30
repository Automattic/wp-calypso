import { getReaderSidebarSiteName } from '../index';

describe( 'getReaderSidebarSiteName', () => {
	test( 'shows the mapped custom domain when the name is only the free *.wordpress.com subdomain', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'lookingforthelight.wordpress.com',
				URL: 'https://lookingforthelight.blog',
			} )
		).toBe( 'lookingforthelight.blog' );
	} );

	test( 'shows the mapped custom domain when the site has no name at all', () => {
		expect( getReaderSidebarSiteName( { name: '', URL: 'https://tyreanstales.com' } ) ).toBe(
			'tyreanstales.com'
		);
	} );

	test( 'keeps a real site title untouched', () => {
		expect(
			getReaderSidebarSiteName( { name: 'My Lovely Blog', URL: 'https://myblog.example' } )
		).toBe( 'My Lovely Blog' );
	} );

	test( 'keeps the free subdomain when the site has no mapped custom domain', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'plainblog.wordpress.com',
				URL: 'https://plainblog.wordpress.com',
			} )
		).toBe( 'plainblog.wordpress.com' );
	} );

	test( 'falls back to the name when there is no URL to derive a domain from', () => {
		expect( getReaderSidebarSiteName( { name: 'somesite.wordpress.com', URL: '' } ) ).toBe(
			'somesite.wordpress.com'
		);
	} );
} );
