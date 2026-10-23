/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExclusiveOffers from '..';
import { render } from '../../../../test-utils';
import type { Agency } from '@automattic/api-core';

describe( '<ExclusiveOffers>', () => {
	test( 'opens the approval gate instead of a referral offer while the agency is in review', async () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( activeAgencyQuery().queryKey, {
			id: 1,
			approval_status: 'pending',
		} as Agency );
		const { router } = render( <ExclusiveOffers />, { queryClient } );
		const startPath = router.state.location.pathname;

		await userEvent.click( await screen.findByRole( 'link', { name: 'Refer WordPress.com' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Referrals unlock once you’re approved' } )
		).toBeVisible();
		expect( router.state.location.pathname ).toBe( startPath );
		expect( sessionStorage.getItem( 'marketplace-type' ) ).toBeNull();
	} );
} );
