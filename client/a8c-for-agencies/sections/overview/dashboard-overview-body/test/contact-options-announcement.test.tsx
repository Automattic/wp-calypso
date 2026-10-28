/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import { createStore } from 'redux';
import {
	completeProfile,
	makeAgencyProfile,
} from 'calypso/dashboard/agency/partner-directory/lead-matching/test/fixtures';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOverviewBody from '..';

test( 'announces contact options to listed classic partners with directory access', async () => {
	const agency = {
		id: 123,
		profile: makeAgencyProfile( false ),
		tier: { id: 'premier-partner' },
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
		lead_matching: { profile: completeProfile },
	};
	const initialState = { a8cForAgencies: { agencies: { activeAgency: agency } } };
	const store = createStore(
		( state = initialState, action: { type: string; agency?: typeof agency } ) =>
			action.type === 'update-agency' && action.agency
				? { a8cForAgencies: { agencies: { activeAgency: action.agency } } }
				: state
	);
	renderWithProvider(
		<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
			<DashboardOverviewBody />
		</AnalyticsProvider>,
		{ store }
	);
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toHaveAttribute(
		'href',
		'/partner-directory/lead-matching'
	);

	const setAgency = ( changes: Partial< typeof agency > ) => {
		act( () => store.dispatch( { type: 'update-agency', agency: { ...agency, ...changes } } ) );
	};
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	setAgency( { profile: { ...agency.profile, partner_directory_application: null } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { partner_directory: { allowed: false } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
} );
