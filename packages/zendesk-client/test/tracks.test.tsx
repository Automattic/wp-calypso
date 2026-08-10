import { addZendeskSiteContext } from '../src/tracks';

describe( 'addZendeskSiteContext', () => {
	test( 'adds the site as blog_id', () => {
		expect( addZendeskSiteContext( { source: 'chat' }, 123 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
		} );
	} );

	test( 'accepts a numeric string site id', () => {
		expect( addZendeskSiteContext( { source: 'chat' }, '123' ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
		} );
	} );

	test.each( [ 0, -1, Number.NaN, null, undefined, 'not-a-number' ] )(
		'omits invalid site id %p',
		( siteId ) => {
			expect( addZendeskSiteContext( { source: 'chat', blog_id: 999 }, siteId ) ).toEqual( {
				source: 'chat',
			} );
		}
	);
} );
