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
	test( 'attaches the site and names its source', () => {
		expect( withSiteContext( { source: 'chat' }, 'primary_site', 123 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
			site_context_source: 'primary_site',
		} );
	} );

	test( 'preserves other caller properties', () => {
		expect( withSiteContext( { source: 'chat', queued_messages: 2 }, 'chat_site', 123 ) ).toEqual( {
			source: 'chat',
			queued_messages: 2,
			blog_id: 123,
			site_context_source: 'chat_site',
		} );
	} );

	test( 'reports none, and omits blog_id, when the site is not usable', () => {
		expect( withSiteContext( { source: 'chat' }, 'explicit', 0 ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
		expect( withSiteContext( { source: 'chat' }, 'primary_site', Number.NaN ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
		expect( withSiteContext( { source: 'chat' }, 'chat_site' ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
	} );

	test( 'ignores the site when the source is deliberately none', () => {
		expect( withSiteContext( { source: 'chat' }, 'none', 123 ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
	} );

	test( 'never lets a caller-supplied blog_id stand in for the site', () => {
		expect( withSiteContext( { source: 'chat', blog_id: 999 }, 'chat_site', 123 ) ).toEqual( {
			source: 'chat',
			blog_id: 123,
			site_context_source: 'chat_site',
		} );
		expect( withSiteContext( { source: 'chat', blog_id: 999 }, 'chat_site' ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
	} );

	test( 'drops force_site_id when no site resolved, so super props cannot backfill one', () => {
		expect( withSiteContext( { force_site_id: true, source: 'article' }, 'support_site' ) ).toEqual(
			{
				source: 'article',
				site_context_source: 'none',
			}
		);
	} );

	test( 'keeps force_site_id when a site resolved', () => {
		expect(
			withSiteContext( { force_site_id: true, source: 'article' }, 'chat_site', 123 )
		).toEqual( {
			force_site_id: true,
			source: 'article',
			blog_id: 123,
			site_context_source: 'chat_site',
		} );
	} );

	test( 'does not mutate the caller properties', () => {
		const properties = { source: 'chat', blog_id: 999 };
		withSiteContext( properties, 'chat_site', 123 );
		expect( properties ).toEqual( { source: 'chat', blog_id: 999 } );
	} );
} );
