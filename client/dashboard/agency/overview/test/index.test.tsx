/**
 * @jest-environment jsdom
 */
import {
	activeAgencyQuery,
	agencyLeadMatchingMutation,
	agencyLeadMatchingQuery,
	queryClient,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
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

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	...jest.requireActual( '@automattic/calypso-config' ),
	default: jest.requireActual( '@automattic/calypso-config' ),
	isEnabled: jest.fn(),
} ) );

jest.mock( '../../earn/use-has-commission-activity', () => ( {
	useHasCommissionActivity: () => ( { hasActivity: false, isLoading: false } ),
} ) );

const matchingKey = agencyLeadMatchingQuery( 123 ).queryKey;
const matchingPath = '/wpcom/v2/agency/123/lead-matching';
const profileLink = () => screen.queryByRole( 'link', { name: 'Complete profile' } );

function makeAgency(): Agency {
	return {
		id: 123,
		name: 'Test Agency',
		profile: makeAgencyProfile( false ),
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
	} as Agency;
}

function renderOverview( agency: Agency | null = makeAgency() ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, agency ? [ agency ] : [] );
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	return render( <AgencyOverview />, { queryClient } );
}

function SaveProfile() {
	const { mutate, isPending } = useMutation( agencyLeadMatchingMutation( 123 ) );
	return (
		<button disabled={ isPending } onClick={ () => mutate( completeProfile ) }>
			Save matching profile
		</button>
	);
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( { queries: { retry: false }, mutations: { retry: false } } );
	jest
		.mocked( isEnabled )
		.mockImplementation( ( flag ) => flag === 'a4a-lead-matching-design-preview' );
} );

afterEach( () => {
	queryClient.clear();
} );

test.each( [
	[
		'incomplete answers with a stale complete boolean',
		{ lead_matching_profile: incompleteProfile },
		true,
	],
	[
		'complete answers while unavailable with a stale incomplete boolean',
		{
			lead_matching_profile: {
				...completeProfile,
				availability: {
					...completeProfile.availability,
					accepting_work: false,
					profile_v2_complete: false,
				},
			},
		},
		false,
	],
	[ 'an explicit null profile', { lead_matching_profile: null }, true ],
	[ 'a saved profile with missing answers', { lead_matching_profile: {} }, true ],
	[ 'an absent profile field', {}, false ],
	[ 'a mismatched agency', { agency_id: 456, lead_matching_profile: incompleteProfile }, false ],
	[
		'a failed sync',
		{ lead_matching_profile: incompleteProfile, sync: { status: 'failed' } },
		false,
	],
] )( 'uses saved endpoint data for %s', async ( _name, response, visible ) => {
	const scope = nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, ...response } );
	renderOverview();
	expect( profileLink() ).not.toBeInTheDocument();
	await waitFor( () =>
		expect( queryClient.getQueryState( matchingKey )?.status ).toBe( 'success' )
	);
	expect( scope.isDone() ).toBe( true );
	expect( Boolean( profileLink() ) ).toBe( visible );
} );

test.each( [ 'flag', 'agency', 'allowed', 'capability', 'approval' ] )(
	'disables the matching query and hides cached data without %s',
	async ( restriction ) => {
		const agency = makeAgency();
		if ( restriction === 'flag' ) {
			jest.mocked( isEnabled ).mockReturnValue( false );
		} else if ( restriction === 'allowed' ) {
			agency.partner_directory = { allowed: false, directories: [] };
		} else if ( restriction === 'capability' ) {
			agency.user = { capabilities: [] };
		} else if ( restriction === 'approval' ) {
			agency.profile = { ...makeAgencyProfile( false ), partner_directory_application: null };
		}
		queryClient.setQueryData( matchingKey, {
			agency_id: 123,
			lead_matching_profile: incompleteProfile,
		} );
		const scope = nock( API ).get( matchingPath ).query( true ).reply( 200, {} );
		renderOverview( restriction === 'agency' ? null : agency );
		await waitFor( () =>
			expect( queryClient.getQueryState( activeAgencyQuery().queryKey )?.status ).toBe( 'success' )
		);
		if ( restriction !== 'agency' ) {
			await screen.findByRole( 'button', { name: 'Contact sales & support' } );
		}
		expect( profileLink() ).not.toBeInTheDocument();
		expect( queryClient.getQueryState( matchingKey )?.fetchStatus ).toBe( 'idle' );
		expect( scope.isDone() ).toBe( false );
	}
);

test( 'hides cached answers after a failed refetch', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	renderOverview();
	expect( await screen.findByRole( 'link', { name: 'Complete profile' } ) ).toBeVisible();
	nock( API ).get( matchingPath ).query( true ).reply( 500, { code: 'error', message: 'Error' } );
	await act( async () => {
		await queryClient.refetchQueries( { queryKey: matchingKey } );
	} );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	expect( queryClient.getQueryState( matchingKey )?.status ).toBe( 'error' );
} );

test( 'follows saves, refreshes and agency changes through the native cache', async () => {
	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	renderOverview();
	const saveView = render( <SaveProfile />, { queryClient } );
	expect( await screen.findByRole( 'link', { name: 'Complete profile' } ) ).toBeVisible();

	const failedSave = nock( API )
		.put( matchingPath )
		.query( true )
		.reply( 500, { code: 'error', message: 'Error' } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Save matching profile' } ) );
	await waitFor( () => expect( queryClient.isMutating() ).toBe( 0 ) );
	expect( failedSave.isDone() ).toBe( true );
	expect( profileLink() ).toBeVisible();

	const saved = mockLeadMatchingSave();
	await userEvent.click( screen.getByRole( 'button', { name: 'Save matching profile' } ) );
	await waitFor( () => expect( profileLink() ).not.toBeInTheDocument() );
	expect( saved.isDone() ).toBe( true );
	saveView.unmount();

	nock( API )
		.get( matchingPath )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: incompleteProfile } );
	await act( async () => {
		await queryClient.refetchQueries( { queryKey: matchingKey } );
	} );
	expect( await screen.findByRole( 'link', { name: 'Complete profile' } ) ).toBeVisible();

	let respond = () => {};
	const switched = nock( API )
		.get( '/wpcom/v2/agency/456/lead-matching' )
		.query( true )
		.reply( ( _uri, _body, callback ) => {
			respond = () =>
				callback( null, [ 200, { agency_id: 456, lead_matching_profile: completeProfile } ] );
		} );
	act( () => {
		queryClient.setQueryData( activeAgencyQuery().queryKey, { ...makeAgency(), id: 456 } );
	} );
	await waitFor( () => expect( switched.isDone() ).toBe( true ) );
	expect( profileLink() ).not.toBeInTheDocument();
	await act( async () => {
		respond();
	} );
	await waitFor( () =>
		expect( queryClient.getQueryState( agencyLeadMatchingQuery( 456 ).queryKey )?.status ).toBe(
			'success'
		)
	);
	expect( switched.isDone() ).toBe( true );
	expect( profileLink() ).not.toBeInTheDocument();
	expect( queryClient.getQueryData( matchingKey ) ).toEqual( {
		agency_id: 123,
		lead_matching_profile: incompleteProfile,
	} );
} );
