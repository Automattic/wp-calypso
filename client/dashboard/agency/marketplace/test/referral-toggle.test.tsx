/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery, referralsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import ReferralToggle from '../referral-toggle';
import type { Agency } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function renderToggle( referrals: unknown[] ) {
	nock( API ).get( '/wpcom/v2/agency/1/referrals' ).query( true ).reply( 200, referrals );
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 1,
		approval_status: 'approved',
	} as Agency );
	render( <ReferralToggle kind="products" />, { queryClient } );
	return queryClient;
}

describe( '<ReferralToggle>', () => {
	beforeEach( () => {
		nock.cleanAll();
	} );

	test( 'shows the commission until the agency’s first referral', async () => {
		renderToggle( [] );

		expect( screen.getByRole( 'checkbox', { name: 'Refer to clients' } ) ).toBeVisible();
		expect( await screen.findByText( 'Earn up to 50%' ) ).toBeVisible();
	} );

	test( 'hides the commission once the agency has referred a client', async () => {
		const queryClient = renderToggle( [
			{ id: 1, client: { id: 1 }, products: [], status: 'active' },
		] );

		await waitFor( () =>
			expect( queryClient.getQueryState( referralsQuery( 1 ).queryKey )?.status ).toBe( 'success' )
		);
		expect( screen.queryByText( 'Earn up to 50%' ) ).not.toBeInTheDocument();
	} );
} );
