/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { pressableLicensesQuery } from '../lib/pressable-products';
import PressableUsageCard from '../pressable-usage-card';
import type { Agency, AgencyProduct } from '@automattic/api-core';

function plan( slug: string, name: string, category: string ): AgencyProduct {
	return {
		name,
		slug,
		product_id: 1,
		currency: 'USD',
		family_slug: 'pressable-hosting',
		metadata: { category, sites: 3, visits: 75000, storage: 35, php_worker_count: 5 },
	};
}

function renderCard( existingPlan: AgencyProduct ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, { id: 1 } as Agency );
	queryClient.setQueryData( agencyProductsQuery( 1 ).queryKey, [] );
	queryClient.setQueryData( pressableLicensesQuery( 1 ).queryKey, [] );
	return render( <PressableUsageCard existingPlan={ existingPlan } />, { queryClient } );
}

const renameNoteButton = () => screen.queryByRole( 'button', { name: 'About your plan name' } );

describe( '<PressableUsageCard>', () => {
	beforeEach( () => {
		jest.useFakeTimers( { now: new Date( '2026-10-08T00:00:00Z' ), advanceTimers: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'explains what a renamed plan used to be called', async () => {
		renderCard( plan( 'pressable-signature-2', 'Pressable Standard 3', 'signature' ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'About your plan name' } ) );

		expect( await screen.findByText( 'Formerly Pressable Signature 2' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Your price, features, sites, visits, and storage haven’t changed.' )
		).toBeInTheDocument();
	} );

	test( 'says nothing while the plan still has its old name', () => {
		renderCard( plan( 'pressable-signature-2', 'Pressable Signature 2', 'signature' ) );

		expect( renameNoteButton() ).not.toBeInTheDocument();
	} );

	test( 'says nothing for a legacy plan', () => {
		renderCard( plan( 'pressable-premium', 'Pressable Premium', 'premium' ) );

		expect( renameNoteButton() ).not.toBeInTheDocument();
	} );
} );
