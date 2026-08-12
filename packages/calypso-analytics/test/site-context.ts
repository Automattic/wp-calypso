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
	test( 'attaches the first usable candidate and names it', () => {
		expect(
			withSiteContext( { source: 'chat' }, [
				[ 'explicit', undefined ],
				[ 'help_center_context', 0 ],
				[ 'primary_site', 123 ],
			] )
		).toEqual( { source: 'chat', blog_id: 123, site_context_source: 'primary_site' } );
	} );

	test( 'prefers the earlier candidate when several are usable', () => {
		expect(
			withSiteContext( {}, [
				[ 'explicit', 123 ],
				[ 'primary_site', 456 ],
			] )
		).toEqual( { blog_id: 123, site_context_source: 'explicit' } );
	} );

	test( 'preserves other caller properties', () => {
		expect(
			withSiteContext( { source: 'chat', queued_messages: 2 }, [ [ 'chat_site', 123 ] ] )
		).toEqual( {
			source: 'chat',
			queued_messages: 2,
			blog_id: 123,
			site_context_source: 'chat_site',
		} );
	} );

	test( 'reports none, and omits blog_id, when no candidate is usable', () => {
		expect(
			withSiteContext( { source: 'chat' }, [
				[ 'explicit', 0 ],
				[ 'primary_site', Number.NaN ],
			] )
		).toEqual( { source: 'chat', site_context_source: 'none' } );
		expect( withSiteContext( { source: 'chat' }, [] ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
	} );

	test( 'never lets a caller-supplied blog_id stand in for the site', () => {
		expect( withSiteContext( { source: 'chat', blog_id: 999 }, [ [ 'chat_site', 123 ] ] ) ).toEqual(
			{ source: 'chat', blog_id: 123, site_context_source: 'chat_site' }
		);
		expect( withSiteContext( { source: 'chat', blog_id: 999 }, [] ) ).toEqual( {
			source: 'chat',
			site_context_source: 'none',
		} );
	} );

	test( 'drops force_site_id when no site resolved, so super props cannot backfill one', () => {
		expect( withSiteContext( { force_site_id: true, source: 'article' }, [] ) ).toEqual( {
			source: 'article',
			site_context_source: 'none',
		} );
	} );

	test( 'keeps force_site_id when a site resolved', () => {
		expect(
			withSiteContext( { force_site_id: true, source: 'article' }, [ [ 'chat_site', 123 ] ] )
		).toEqual( {
			force_site_id: true,
			source: 'article',
			blog_id: 123,
			site_context_source: 'chat_site',
		} );
	} );

	test( 'does not mutate the caller properties', () => {
		const properties = { source: 'chat', blog_id: 999 };
		withSiteContext( properties, [ [ 'chat_site', 123 ] ] );
		expect( properties ).toEqual( { source: 'chat', blog_id: 999 } );
	} );
} );
