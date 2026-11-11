import { siteByIdQuery, siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getSuperProps } from '../super-props';
import type { Site, User } from '@automattic/api-core';
import type { AnyRouter } from '@tanstack/react-router';

const user = { site_count: 2 } as User;

function createRouter( siteSlug?: string ) {
	return {
		state: {
			matches: siteSlug ? [ { params: { siteSlug } } ] : [],
		},
	} as unknown as AnyRouter;
}

describe( 'getSuperProps', () => {
	test( 'preserves explicit blog_id when route site differs', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteBySlugQuery( 'route-site' ).queryKey, {
			ID: 11,
			lang: 'en',
		} as unknown as Site );

		const superProps = getSuperProps(
			user,
			createRouter( 'route-site' ),
			queryClient
		)( { blog_id: 22 } );

		expect( superProps.blog_id ).toBe( 22 );
	} );

	test( 'uses cached explicit site metadata when available', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteByIdQuery( 22 ).queryKey, {
			ID: 22,
			lang: 'it',
			jetpack: true,
			plan: { product_id: 'business' },
		} as unknown as Site );

		const superProps = getSuperProps(
			user,
			createRouter( 'route-site' ),
			queryClient
		)( { blog_id: 22 } );

		expect( superProps ).toEqual(
			expect.objectContaining( {
				blog_id: 22,
				blog_lang: 'it',
				site_id_label: 'jetpack',
				site_plan_id: 'business',
			} )
		);
	} );

	test( 'uses explicit site metadata cached by slug', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteBySlugQuery( 'explicit-site' ).queryKey, {
			ID: 22,
			lang: 'it',
			jetpack: true,
			plan: { product_id: 'business' },
		} as unknown as Site );

		const superProps = getSuperProps(
			user,
			createRouter( 'route-site' ),
			queryClient
		)( { blog_id: 22 } );

		expect( superProps ).toEqual(
			expect.objectContaining( {
				blog_id: 22,
				blog_lang: 'it',
				site_id_label: 'jetpack',
				site_plan_id: 'business',
			} )
		);
	} );

	test( 'does not infer route site when site context is explicitly absent', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteBySlugQuery( 'route-site' ).queryKey, {
			ID: 11,
			lang: 'en',
		} as unknown as Site );

		const superProps = getSuperProps(
			user,
			createRouter( 'route-site' ),
			queryClient
		)( { force_site_id: true, site_context_source: 'none' } );

		expect( superProps ).not.toHaveProperty( 'blog_id' );
	} );
} );
