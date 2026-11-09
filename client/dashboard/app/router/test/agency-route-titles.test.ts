/**
 * @jest-environment jsdom
 */

import {
	activeAgencyQuery,
	agencyProductsQuery,
	queryClient,
	referralsQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { agencySiteRoute, earnReferralRoute } from '../agency';
import type { Agency, Referral, Site } from '@automattic/api-core';

type Head = ( context: unknown ) => { meta: Array< { title?: string } > };

const titleOf = ( route: { options: { head?: unknown } }, context: unknown ) =>
	( route.options.head as Head )( context ).meta[ 0 ].title;

describe( 'agency route titles', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'titles a site page with the site name', () => {
		queryClient.setQueryData( siteBySlugQuery( 'example.wpcomstaging.com' ).queryKey, {
			ID: 1,
			name: 'Example Site',
			slug: 'example.wpcomstaging.com',
			URL: 'https://example.wpcomstaging.com',
			site_migration: {},
		} as unknown as Site );

		expect( titleOf( agencySiteRoute, { params: { siteSlug: 'example.wpcomstaging.com' } } ) ).toBe(
			'Example Site'
		);
	} );

	test( 'titles a referral page with the client email', async () => {
		queryClient.setQueryData( activeAgencyQuery().queryKey, { id: 5 } as unknown as Agency );
		queryClient.setQueryData( agencyProductsQuery( 5 ).queryKey, [] );
		queryClient.setQueryData( referralsQuery( 5 ).queryKey, [
			{ id: 41, client: { id: 1, email: 'other@example.com' } },
			{ id: 42, client: { id: 2, email: 'client@example.com' } },
		] as unknown as Referral[] );

		const loader = earnReferralRoute.options.loader as unknown as ( context: {
			params: { referralId: string };
		} ) => Promise< unknown >;
		const loaderData = await loader( { params: { referralId: '42' } } );

		expect( titleOf( earnReferralRoute, { loaderData } ) ).toBe( 'client@example.com' );
	} );

	test( 'falls back to a generic referral title when the referral is missing', () => {
		expect( titleOf( earnReferralRoute, { loaderData: {} } ) ).toBe( 'Referral details' );
	} );
} );
