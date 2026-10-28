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
import type { Agency } from '@automattic/api-core';

jest.mock( '../../earn/use-has-commission-activity', () => ( {
	useHasCommissionActivity: () => ( { hasActivity: false, isLoading: false } ),
} ) );

test( 'announces contact options to eligible native partners even when unavailable and complete', async () => {
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
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( agencyLeadMatchingQuery( agency.id ).queryKey, {
		agency_id: agency.id,
		lead_matching_profile: completeProfile,
	} );
	render( <AgencyOverview />, { queryClient } );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toHaveAttribute(
		'href',
		'/partner-directory/lead-matching/preferences'
	);

	const setAgency = ( changes: Partial< Agency > ) => {
		act( () =>
			queryClient.setQueryData( activeAgencyQuery().queryKey, { ...agency, ...changes } )
		);
	};
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	setAgency( { tier: { id: 'agency-partner' } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( {} );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	setAgency( { user: { capabilities: [] } } );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	queryClient.clear();
} );
