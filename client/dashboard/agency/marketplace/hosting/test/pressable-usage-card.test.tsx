/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery, agencyProductsQuery, queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { pressableLicensesQuery } from '../lib/pressable-products';
import PressableUsageCard from '../pressable-usage-card';
import type { Agency, AgencyProduct } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const DISMISS_PREFERENCE = 'a4a-pressable-plan-rename-notice-dismissed';
const NOTICE_TEXT =
	'Pressable Signature 2 is now Pressable Standard 3. Your price, features, sites, visits, and storage haven’t changed.';

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

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

// The dismissal writes back through the shared query client, so the tests render with it.
function renderCard( existingPlan: AgencyProduct ) {
	queryClient.setQueryData( activeAgencyQuery().queryKey, { id: 1 } as Agency );
	queryClient.setQueryData( agencyProductsQuery( 1 ).queryKey, [] );
	queryClient.setQueryData( pressableLicensesQuery( 1 ).queryKey, [] );
	return render( <PressableUsageCard existingPlan={ existingPlan } />, { queryClient } );
}

const renameNotice = () => screen.queryByText( 'Your plan has a new name' );

describe( '<PressableUsageCard>', () => {
	beforeEach( () => {
		nock.cleanAll();
		queryClient.clear();
		jest.useFakeTimers( { now: new Date( '2026-10-08T00:00:00Z' ), advanceTimers: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'tells the agency its plan was renamed until dismissed', async () => {
		mockPreferences();
		const save = nock( API )
			.post(
				'/rest/v1.1/me/preferences',
				( body ) => body?.calypso_preferences?.[ DISMISS_PREFERENCE ] === true
			)
			.reply( 200, { calypso_preferences: { [ DISMISS_PREFERENCE ]: true } } );
		renderCard( plan( 'pressable-signature-2', 'Pressable Standard 3', 'signature' ) );

		expect( await screen.findByText( NOTICE_TEXT ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
		await waitFor( () => expect( save.isDone() ).toBe( true ) );
		await waitFor( () => expect( renameNotice() ).not.toBeInTheDocument() );
	} );

	test( 'stays dismissed', async () => {
		mockPreferences( { [ DISMISS_PREFERENCE ]: true } );
		renderCard( plan( 'pressable-signature-2', 'Pressable Standard 3', 'signature' ) );

		await waitFor( () => expect( nock.pendingMocks() ).toHaveLength( 0 ) );
		expect( renameNotice() ).not.toBeInTheDocument();
	} );

	test( 'says nothing while the plan still has its old name', () => {
		mockPreferences();
		renderCard( plan( 'pressable-signature-2', 'Pressable Signature 2', 'signature' ) );

		expect( renameNotice() ).not.toBeInTheDocument();
	} );

	test( 'says nothing for a legacy plan', () => {
		mockPreferences();
		renderCard( plan( 'pressable-premium', 'Pressable Premium', 'premium' ) );

		expect( renameNotice() ).not.toBeInTheDocument();
	} );
} );
