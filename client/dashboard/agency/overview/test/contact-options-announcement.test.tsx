/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyLeadMatchingQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import AgencyOverview from '..';
import { render } from '../../../test-utils';
import {
	API,
	completeProfile,
	makeAgencyProfile,
} from '../../partner-directory/lead-matching/test/fixtures';
import type { Agency, AgencyLeadMatchingProfile } from '@automattic/api-core';

jest.mock( '../../earn/use-has-commission-activity', () => ( {
	useHasCommissionActivity: () => ( { hasActivity: false, isLoading: false } ),
} ) );

test( 'announces missing saved contact options only to eligible native partners with complete answers', async () => {
	const agency = {
		id: 123,
		name: 'Test Agency',
		tier: { id: 'pro-agency-partner' },
		profile: makeAgencyProfile( false ),
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
	} as Agency;
	const profile = {
		...completeProfile,
		availability: {
			...completeProfile.availability,
			accepting_work: false,
			profile_v2_complete: null,
		},
	};
	const leadMatchingRequest = nock( API )
		.get( `/wpcom/v2/agency/${ agency.id }/lead-matching` )
		.query( true )
		.reply( 200, { agency_id: agency.id, lead_matching_profile: profile } );
	nock( API ).get( '/wpcom/v2/agency' ).query( true ).reply( 200, [ agency ] );
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	const leadMatchingQuery = agencyLeadMatchingQuery( agency.id );
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	const view = render( <AgencyOverview />, { queryClient } );
	expect( announcement() ).not.toBeInTheDocument();
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toHaveAttribute(
		'href',
		'/partner-directory/lead-matching/preferences'
	);
	expect( leadMatchingRequest.isDone() ).toBe( true );

	const setProfile = ( savedProfile: AgencyLeadMatchingProfile | null ) => {
		act( () =>
			queryClient.setQueryData( leadMatchingQuery.queryKey, {
				agency_id: agency.id,
				lead_matching_profile: savedProfile,
			} )
		);
	};
	const contact = { phone: '+442012345678', booking_link: 'https://booking.example.com' };
	setProfile( { ...profile, contact } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setProfile( { ...profile, contact: { ...contact, phone: '' } } );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();

	setProfile( {
		...profile,
		availability: { ...profile.availability, profile_v2_complete: true },
		project_types: { ...profile.project_types, supported_project_types: [ 'unknown' ] },
	} );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setProfile( profile );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();

	const setAgency = ( changes: Partial< Agency > ) => {
		act( () =>
			queryClient.setQueryData( activeAgencyQuery().queryKey, { ...agency, ...changes } )
		);
	};
	setAgency( { tier: { id: 'agency-partner' } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { user: { capabilities: [] } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	view.unmount();
	queryClient.clear();
} );
