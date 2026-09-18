/**
 * @jest-environment jsdom
 */
import { siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../test-utils';
import { CheckoutSuccessFlashMessage } from '../checkout-success-flash-message';
import type { Site } from '@automattic/api-core';

const SITE_ID = 123;

function mockSite( reply: [ number, object ] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ SITE_ID }` )
		.query( true )
		.reply( ...reply );
}

function snackbar( content: string ) {
	return [ expect.objectContaining( { status: 'success', type: 'snackbar', content } ) ];
}

beforeEach( () => {
	window.history.replaceState(
		{},
		'',
		`/?flash=checkout-success&plan_site_id=${ SITE_ID }&keep=1`
	);
} );

afterEach( () => {
	nock.cleanAll();
	select( noticesStore )
		.getNotices()
		.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
} );

describe( '<CheckoutSuccessFlashMessage>', () => {
	test( 'names the purchased plan from fresh site data, not the cached pre-purchase plan', async () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( siteByIdQuery( SITE_ID ).queryKey, {
			ID: SITE_ID,
			plan: { product_name_short: 'Free' },
		} as Site );
		mockSite( [ 200, { ID: SITE_ID, plan: { product_name_short: 'Personal' } } ] );

		render( <CheckoutSuccessFlashMessage />, { queryClient } );

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual(
				snackbar( "You're in! The Personal Plan is now active." )
			)
		);
		expect( window.location.search ).toBe( '?keep=1' );
	} );

	test( 'falls back to the generic message when the site cannot be loaded', async () => {
		mockSite( [ 404, { error: 'unknown_blog', message: 'Unknown blog' } ] );

		render( <CheckoutSuccessFlashMessage /> );

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual(
				snackbar( 'Your purchase was completed.' )
			)
		);
	} );
} );
