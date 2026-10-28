/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyLeadMatchingQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import AgencyOverview from '..';
import { render } from '../../../test-utils';
import {
	API,
	completeProfile,
	makeAgencyProfile,
} from '../../partner-directory/lead-matching/test/fixtures';
import type { Agency } from '@automattic/api-core';

jest.mock( '../../earn/use-has-commission-activity', () => ( {
	useHasCommissionActivity: () => ( { hasActivity: false, isLoading: false } ),
} ) );

afterEach( () => window.history.replaceState( {}, '', '/' ) );

test( 'announces contact fields independently of matching progress and availability, with accessible native routing', async () => {
	window.history.replaceState( {}, '', '/?flags=+oauth,-unrelated' );
	const agency = {
		id: 123,
		name: 'Test Agency',
		tier: { id: 'pro-agency-partner' },
		profile: makeAgencyProfile( false ),
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
	} as Agency;
	nock( API ).get( '/wpcom/v2/agency' ).query( true ).reply( 200, [ agency ] );
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	const matchingRead = nock( API )
		.get( /\/wpcom\/v2\/agency\/\d+\/lead-matching$/ )
		.query( true )
		.reply( 200, {} )
		.persist();
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( agencyLeadMatchingQuery( agency.id ).queryKey, {
		agency_id: agency.id,
		lead_matching_profile: completeProfile,
	} );
	const { recordTracksEvent, router } = render( <AgencyOverview />, { queryClient } );
	const navigate = jest.spyOn( router, 'navigate' ).mockResolvedValue( undefined );
	const link = await screen.findByRole< HTMLAnchorElement >( 'link', {
		name: 'Update your details',
	} );
	const destination = new URL( link.href );
	expect( destination.pathname ).toBe( '/partner-directory/lead-matching/preferences' );
	expect( destination.searchParams.get( 'flags' ) ).toBe( '+oauth,-unrelated' );
	expect( recordTracksEvent ).not.toHaveBeenCalledWith(
		'calypso_a4a_overview_event_cta_click',
		expect.anything()
	);
	await userEvent.click( link );
	expect( navigate ).toHaveBeenCalledWith(
		expect.objectContaining( {
			to: '/partner-directory/lead-matching/preferences',
			search: { flags: '+oauth,-unrelated' },
		} )
	);
	expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_event_cta_click', {
		event_id: 'a4a-lead-matching-contact-options',
		cta_id: 'update-details',
	} );
	expect(
		jest
			.mocked( recordTracksEvent )
			.mock.calls.filter( ( [ name ] ) => name === 'calypso_a4a_overview_event_cta_click' )
	).toHaveLength( 1 );

	const setAgency = ( changes: object ) => {
		act( () =>
			queryClient.setQueryData( activeAgencyQuery().queryKey, { ...agency, ...changes } )
		);
	};
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	setAgency( { tier: { id: 'agency-partner' } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { tier: { id: 'unknown' } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( { id: 456, tier: { id: 'vip-pro-agency-partner' }, profile: makeAgencyProfile() } );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { user: { capabilities: [] } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	expect( matchingRead.isDone() ).toBe( false );
	queryClient.clear();
} );
