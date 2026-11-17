/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createStore } from 'redux';
import { getLeadMatchingProfileQueryKey } from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import useSubmitLeadMatchingProfileMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-lead-matching-profile';
import {
	API,
	completeProfile,
	incompleteProfile,
	makeAgencyProfile,
	mockLeadMatchingSave,
} from 'calypso/dashboard/agency/partner-directory/lead-matching/test/fixtures';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOverviewBody from '..';
import type { AgencyTierId } from '@automattic/api-core';

const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
const matchingKey = getLeadMatchingProfileQueryKey( 123 );
const matchingPath = '/wpcom/v2/agency/123/lead-matching';
const profileLink = () => screen.queryByRole( 'link', { name: /^(Set up|Finish) preferences$/ } );

function makeAgency() {
	return {
		id: 123,
		profile: makeAgencyProfile(),
		tier: { id: 'pro-agency-partner' as AgencyTierId },
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
	};
}

function SaveProfile() {
	const { mutate, isPending } = useSubmitLeadMatchingProfileMutation();
	return (
		<button disabled={ isPending } onClick={ () => mutate( completeProfile ) }>
			Save matching profile
		</button>
	);
}

function renderOverview( agency = makeAgency(), withSave = false ) {
	const initialState = { a8cForAgencies: { agencies: { activeAgency: agency } } };
	const store = createStore(
		( state = initialState, action: { type: string; agency?: ReturnType< typeof makeAgency > } ) =>
			action.type === 'update-agency' && action.agency
				? { a8cForAgencies: { agencies: { activeAgency: action.agency } } }
				: state
	);
	renderWithProvider(
		<>
			<DashboardOverviewBody />
			{ withSave && <SaveProfile /> }
		</>,
		{ store, queryClient }
	);
	return store;
}

afterEach( () => {
	queryClient.clear();
	nock.cleanAll();
} );

test( 'shows empty and partial saved preferences, then hides after a successful classic save', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: null } );
	renderOverview( makeAgency(), true );
	const link = await screen.findByRole( 'link', { name: 'Set up preferences' } );
	expect( link ).toHaveAttribute( 'href', '/partner-directory/lead-matching' );

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

test( 'requires a qualifying tier and saved agency availability for the classic card', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	const store = renderOverview();
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();

	const setAgency = ( agency: ReturnType< typeof makeAgency > ) => {
		act( () => store.dispatch( { type: 'update-agency', agency } ) );
	};
	setAgency( { ...makeAgency(), tier: { id: 'agency-partner' } } );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	setAgency( { ...makeAgency(), tier: { id: 'premier-partner' } } );
	expect( await screen.findByRole( 'link', { name: 'Finish preferences' } ) ).toBeVisible();
	setAgency( { ...makeAgency(), profile: makeAgencyProfile( false ) } );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
} );

test( 'hides cached preferences without an approved directory listing', async () => {
	queryClient.setQueryData( matchingKey, {
		agency_id: 123,
		lead_matching_profile: incompleteProfile,
	} );
	const agency = makeAgency();
	agency.profile.partner_directory_application = null;
	renderOverview( agency );
	await screen.findByRole( 'link', { name: 'Contact sales & support' } );
	expect( profileLink() ).not.toBeInTheDocument();
} );

test( 'hides cached preferences when classic directory access is denied', async () => {
	queryClient.setQueryData( matchingKey, {
		agency_id: 123,
		lead_matching_profile: incompleteProfile,
	} );
	const agency = makeAgency();
	agency.partner_directory.allowed = false;
	renderOverview( agency );
	await screen.findByRole( 'link', { name: 'Contact sales & support' } );
	expect( profileLink() ).not.toBeInTheDocument();
} );
