/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createStore } from 'redux';
import { getLeadMatchingProfileQueryKey } from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import useSubmitLeadMatchingProfileMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-lead-matching-profile';
import { mapLeadMatchingProfileToFormData } from 'calypso/a8c-for-agencies/sections/partner-directory/utils/map-application-form-data';
import {
	API,
	completeProfile,
	incompleteProfile,
	makeAgencyProfile,
	mockLeadMatchingSave,
} from 'calypso/dashboard/agency/partner-directory/lead-matching/test/fixtures';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOverviewBody from '..';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	...jest.requireActual( '@automattic/calypso-config' ),
	default: jest.requireActual( '@automattic/calypso-config' ),
	isEnabled: jest.fn(),
} ) );

const matchingKey = getLeadMatchingProfileQueryKey( 123 );
const matchingPath = '/wpcom/v2/agency/123/lead-matching';
const profileLink = () => screen.queryByRole( 'link', { name: /^(Set up|Finish) preferences$/ } );

function makeAgency( id = 123 ) {
	return {
		id,
		profile: makeAgencyProfile(),
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
		lead_matching: {
			draft: mapLeadMatchingProfileToFormData( completeProfile ),
			profile: completeProfile,
		},
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

function renderOverview( queryClient: QueryClient, withSave = false, agency = makeAgency() ) {
	const initialState = { a8cForAgencies: { agencies: { activeAgency: agency } } };
	const store = createStore(
		(
			state = initialState,
			action: { type: string; agency?: ReturnType< typeof makeAgency > }
		) => {
			if ( action.type === 'switch-agency' && action.agency ) {
				return { a8cForAgencies: { agencies: { activeAgency: action.agency } } };
			}
			return state;
		}
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

beforeEach( () => {
	jest.mocked( isEnabled ).mockReturnValue( false );
} );

test( 'uses the classic endpoint cache for saved answers, saves and agency changes', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const fetched = nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	const store = renderOverview( queryClient, true );
	expect(
		await screen.findByRole( 'link', { name: /^(Set up|Finish) preferences$/ } )
	).toBeVisible();
	expect( fetched.isDone() ).toBe( true );
	expect( profileLink() ).toHaveAttribute( 'href', '/partner-directory/lead-matching' );

	const failedSync = nock( API )
		.put( matchingPath )
		.query( true )
		.reply( 200, {
			agency_id: 123,
			lead_matching_profile: incompleteProfile,
			sync: { status: 'failed' },
		} );
	await userEvent.click( screen.getByRole( 'button', { name: 'Save matching profile' } ) );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	expect( failedSync.isDone() ).toBe( true );
	expect( queryClient.getQueryData( matchingKey ) ).toEqual(
		expect.objectContaining( { sync: { status: 'failed' } } )
	);

	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	await act( async () => {
		await queryClient.refetchQueries( { queryKey: matchingKey } );
	} );
	expect(
		await screen.findByRole( 'link', { name: /^(Set up|Finish) preferences$/ } )
	).toBeVisible();
	const saved = mockLeadMatchingSave();
	await userEvent.click( screen.getByRole( 'button', { name: 'Save matching profile' } ) );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	expect( saved.isDone() ).toBe( true );
	expect( queryClient.getQueryData( matchingKey ) ).toEqual(
		expect.objectContaining( { lead_matching_profile: completeProfile } )
	);

	const switched = nock( API )
		.get( '/wpcom/v2/agency/456/lead-matching' )
		.query( true )
		.reply( 200, { agency_id: 456, lead_matching_profile: null } );
	act( () => {
		store.dispatch( { type: 'switch-agency', agency: makeAgency( 456 ) } );
	} );
	expect(
		await screen.findByRole( 'link', { name: /^(Set up|Finish) preferences$/ } )
	).toBeVisible();
	expect( switched.isDone() ).toBe( true );
	queryClient.clear();
} );

test( 'disables the classic query and hides cached answers for an ineligible agency', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( matchingKey, {
		agency_id: 123,
		lead_matching_profile: incompleteProfile,
	} );
	const scope = nock( API ).get( matchingPath ).query( true ).reply( 200, {} );
	const agency = makeAgency();
	agency.partner_directory.allowed = false;
	renderOverview( queryClient, false, agency );
	expect( await screen.findByRole( 'link', { name: 'Contact sales & support' } ) ).toBeVisible();
	expect( profileLink() ).not.toBeInTheDocument();
	expect( queryClient.getQueryState( matchingKey )?.fetchStatus ).toBe( 'idle' );
	expect( scope.isDone() ).toBe( false );
	queryClient.clear();
} );

test( 'forces the classic card for design review without granting access', async () => {
	jest
		.mocked( isEnabled )
		.mockImplementation( ( flag ) => flag === 'a4a-lead-matching-design-preview' );
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( matchingKey, {
		agency_id: 123,
		lead_matching_profile: completeProfile,
	} );
	const agency = makeAgency();
	agency.partner_directory.allowed = false;
	const scope = nock( API ).get( matchingPath ).query( true ).reply( 200, {} );
	renderOverview( queryClient, false, agency );

	expect(
		await screen.findByRole( 'link', { name: /^(Set up|Finish) preferences$/ } )
	).toBeVisible();
	expect( scope.isDone() ).toBe( false );
	queryClient.clear();
} );
