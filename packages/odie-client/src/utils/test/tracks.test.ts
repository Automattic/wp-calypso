import { addOdieSiteContext } from '../tracks';

describe( 'addOdieSiteContext', () => {
	test( 'adds selected site to event properties', () => {
		expect( addOdieSiteContext( { source: 'chat' }, 123 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
		} );
	} );

	test.each( [ 0, -1, Number.NaN, null, undefined ] )( 'omits invalid site ID %p', ( siteId ) => {
		expect( addOdieSiteContext( { source: 'chat', blog_id: 999 }, siteId ) ).toEqual( {
			source: 'chat',
		} );
	} );
} );
