/**
 * @jest-environment jsdom
 */
import {
	activeAgencyQuery,
	agencyLeadMatchingMutation,
	agencyLeadMatchingQuery,
	queryClient,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import AgencyOverview from '..';
import { render } from '../../../test-utils';
import {
	API,
	completeProfile,
	incompleteProfile,
	makeAgencyProfile,
	mockLeadMatchingSave,
} from '../../partner-directory/lead-matching/test/fixtures';
import type { Agency } from '@automattic/api-core';

jest.mock( '../../earn/use-has-commission-activity', () => ( {
	useHasCommissionActivity: () => ( { hasActivity: false, isLoading: false } ),
} ) );

const matchingKey = agencyLeadMatchingQuery( 123 ).queryKey;
const matchingPath = '/wpcom/v2/agency/123/lead-matching';
const profileLink = () => screen.queryByRole( 'link', { name: /^(Set up|Finish) preferences$/ } );

function makeAgency(): Agency {
	return {
		id: 123,
		name: 'Test Agency',
		profile: makeAgencyProfile(),
		tier: { id: 'pro-agency-partner' },
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
	} as Agency;
}

function SaveProfile() {
	const { mutate, isPending } = useMutation( agencyLeadMatchingMutation( 123 ) );
	return (
		<button disabled={ isPending } onClick={ () => mutate( completeProfile ) }>
			Save matching profile
		</button>
	);
}

function renderOverview( agency = makeAgency(), withSave = false ) {
	nock( API ).get( '/wpcom/v2/agency' ).query( true ).reply( 200, [ agency ] );
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	return render(
		<>
			<AgencyOverview />
			{ withSave && <SaveProfile /> }
		</>,
		{ queryClient }
	);
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( { queries: { retry: false }, mutations: { retry: false } } );
} );

afterEach( () => {
	queryClient.clear();
	nock.cleanAll();
} );

test( 'shows empty and partial saved preferences, then hides after a successful native save', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: null } );
	const { recordTracksEvent } = renderOverview( makeAgency(), true );
	const link = await screen.findByRole( 'link', { name: 'Set up preferences' } );
	expect( link ).toHaveAttribute( 'href', '/partner-directory/lead-matching/preferences' );
	link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
	await userEvent.click( link );
	expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_lead_matching_click', {
		agency_id: 123,
	} );

	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	await act( async () => {
		await queryClient.refetchQueries( { queryKey: matchingKey } );
	} );
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();
	expect(
		screen.getByRole( 'progressbar', { value: { text: /questions answered/ } } )
	).toHaveAttribute( 'aria-valuenow', '10' );

	mockLeadMatchingSave();
	await userEvent.click( screen.getByRole( 'button', { name: 'Save matching profile' } ) );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
} );

test( 'requires a qualifying tier and saved agency availability for the native card', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	renderOverview();
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();

	const setAgency = ( agency: Agency ) => {
		act( () => queryClient.setQueryData( activeAgencyQuery().queryKey, agency ) );
	};
	setAgency( { ...makeAgency(), tier: { id: 'agency-partner' } } );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	setAgency( { ...makeAgency(), tier: { id: 'vip-pro-agency-partner' } } );
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();
	setAgency( { ...makeAgency(), profile: makeAgencyProfile( false ) } );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
} );

test( 'hides cached preferences without native read access', async () => {
	queryClient.setQueryData( matchingKey, {
		agency_id: 123,
		lead_matching_profile: incompleteProfile,
	} );
	const agency = makeAgency();
	agency.user = { capabilities: [] };
	renderOverview( agency );
	await screen.findByRole( 'button', { name: 'Contact sales & support' } );
	expect( profileLink() ).not.toBeInTheDocument();
} );

test( 'hides cached preferences after a failed native refetch', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	renderOverview();
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();
	nock( API ).get( matchingPath ).query( true ).reply( 500, { code: 'error', message: 'Error' } );
	await act( async () => {
		await queryClient.refetchQueries( { queryKey: matchingKey } );
	} );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
} );
