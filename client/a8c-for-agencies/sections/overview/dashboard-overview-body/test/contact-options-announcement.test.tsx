/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createStore } from 'redux';
import { getLeadMatchingProfileQueryKey } from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import {
	API,
	completeProfile,
	makeAgencyProfile,
} from 'calypso/dashboard/agency/partner-directory/lead-matching/test/fixtures';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOverviewBody from '..';
import type { AgencyLeadMatchingResponse } from '@automattic/api-core';

test( 'announces missing saved contact options only to listed classic partners with complete answers and access', async () => {
	const agency = {
		id: 123,
		profile: makeAgencyProfile( false ),
		tier: { id: 'premier-partner' },
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
		lead_matching: { profile: completeProfile },
	};
	const savedResponse: AgencyLeadMatchingResponse = {
		agency_id: agency.id,
		lead_matching_profile: {
			...completeProfile,
			availability: {
				...completeProfile.availability,
				accepting_work: false,
				profile_v2_complete: null,
			},
		},
	};
	const leadMatchingRequest = nock( API )
		.get( `/wpcom/v2/agency/${ agency.id }/lead-matching` )
		.query( true )
		.reply( 200, savedResponse );
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	const initialState = { a8cForAgencies: { agencies: { activeAgency: agency } } };
	const store = createStore(
		( state = initialState, action: { type: string; agency?: typeof agency } ) =>
			action.type === 'update-agency' && action.agency
				? { a8cForAgencies: { agencies: { activeAgency: action.agency } } }
				: state
	);
	const view = renderWithProvider(
		<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
			<DashboardOverviewBody />
		</AnalyticsProvider>,
		{ store, queryClient }
	);
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	expect( announcement() ).not.toBeInTheDocument();
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toHaveAttribute(
		'href',
		'/partner-directory/lead-matching'
	);
	expect( leadMatchingRequest.isDone() ).toBe( true );

	const setLeadMatching = ( changes: Partial< AgencyLeadMatchingResponse > ) => {
		act( () =>
			queryClient.setQueryData( getLeadMatchingProfileQueryKey( agency.id ), {
				...savedResponse,
				...changes,
			} )
		);
	};
	const contact = { phone: '+442012345678', booking_link: 'https://booking.example.com' };
	setLeadMatching( { lead_matching_profile: { ...completeProfile, contact } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setLeadMatching( {
		lead_matching_profile: { ...completeProfile, contact: { ...contact, booking_link: '' } },
	} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();

	setLeadMatching( { lead_matching_profile: null } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setLeadMatching( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();

	const setAgency = ( changes: Partial< typeof agency > ) => {
		act( () => store.dispatch( { type: 'update-agency', agency: { ...agency, ...changes } } ) );
	};
	setAgency( { profile: { ...agency.profile, partner_directory_application: null } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { partner_directory: { allowed: false } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	view.unmount();
	queryClient.clear();
} );
