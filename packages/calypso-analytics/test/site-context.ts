import { getValidBlogId, withSiteContext } from '../src/utils/site-context';

describe( 'getValidBlogId', () => {
	test( 'accepts positive integers and numeric strings', () => {
		expect( getValidBlogId( 123 ) ).toBe( 123 );
		expect( getValidBlogId( '123' ) ).toBe( 123 );
	} );

	test.each( [ 0, -1, 1.5, Number.NaN, null, undefined, '', 'not-a-number', {} ] )(
		'rejects %p',
		( value ) => {
			expect( getValidBlogId( value ) ).toBeUndefined();
		}
	);
} );

describe( 'withSiteContext', () => {
	test( 'attaches the first valid candidate as blog_id', () => {
		expect( withSiteContext( { source: 'chat' }, undefined, 0, 123, 456 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
		} );
	} );

	test( 'preserves other caller properties', () => {
		expect( withSiteContext( { source: 'chat', queued_messages: 2 }, 123 ) ).toEqual( {
			source: 'chat',
			queued_messages: 2,
			blog_id: 123,
		} );
	} );

	test( 'omits blog_id when no candidate is usable', () => {
		expect( withSiteContext( { source: 'chat' }, 0, Number.NaN, null, undefined ) ).toEqual( {
			source: 'chat',
		} );
	} );

	test( 'never lets a caller-supplied blog_id stand in for the site', () => {
		expect( withSiteContext( { source: 'chat', blog_id: 999 }, 123 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
		} );
		expect( withSiteContext( { source: 'chat', blog_id: 999 } ) ).toEqual( { source: 'chat' } );
	} );

	test( 'does not mutate the caller properties', () => {
		const properties = { source: 'chat', blog_id: 999 };
		withSiteContext( properties, 123 );
		expect( properties ).toEqual( { source: 'chat', blog_id: 999 } );
	} );
} );
