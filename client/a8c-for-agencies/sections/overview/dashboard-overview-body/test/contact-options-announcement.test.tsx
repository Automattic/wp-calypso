/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createStore } from 'redux';
import {
	API,
	completeProfile,
	makeAgencyProfile,
} from 'calypso/dashboard/agency/partner-directory/lead-matching/test/fixtures';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOverviewBody from '..';
import type { AgencyTierId } from '@automattic/api-core';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEvent: jest.fn( () => ( { type: 'test-track' } ) ),
} ) );

function makeAgency( tierId: AgencyTierId | undefined = 'premier-partner' ) {
	return {
		id: 123,
		profile: makeAgencyProfile( false ),
		tier: tierId ? { id: tierId } : undefined,
		partner_directory: { allowed: true },
		user: { capabilities: [ 'a4a_read_partner_directory' ] },
		lead_matching: { profile: completeProfile },
	};
}

afterEach( () => {
	window.history.replaceState( {}, '', '/' );
	nock.cleanAll();
} );

test( 'announces contact fields to listed partners with classic access, regardless of availability or completion', async () => {
	window.history.replaceState( {}, '', '/?flags=+oauth,-unrelated' );
	const initialState = { a8cForAgencies: { agencies: { activeAgency: makeAgency() } } };
	const store = createStore(
		( state = initialState, action: { type: string; agency?: ReturnType< typeof makeAgency > } ) =>
			action.type === 'switch-agency' && action.agency
				? { a8cForAgencies: { agencies: { activeAgency: action.agency } } }
				: state
	);
	const matchingRead = nock( API )
		.get( /\/wpcom\/v2\/agency\/\d+\/lead-matching$/ )
		.query( true )
		.reply( 200, {} )
		.persist();
	renderWithProvider(
		<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
			<DashboardOverviewBody />
		</AnalyticsProvider>,
		{ store }
	);
	const link = await screen.findByRole< HTMLAnchorElement >( 'link', {
		name: 'Update your details',
	} );
	const destination = new URL( link.href );
	expect( destination.pathname ).toBe( '/partner-directory/lead-matching' );
	expect( destination.searchParams.get( 'flags' ) ).toBe( '+oauth,-unrelated' );
	expect( recordTracksEvent ).not.toHaveBeenCalledWith(
		'calypso_a4a_overview_event_cta_click',
		expect.anything()
	);
	link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
	await userEvent.click( link );
	expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_event_cta_click', {
		event_id: 'a4a-lead-matching-contact-options',
		cta_id: 'update-details',
	} );

	const setAgency = ( agency: ReturnType< typeof makeAgency > ) => {
		act( () => store.dispatch( { type: 'switch-agency', agency } ) );
	};
	const announcement = () => screen.queryByRole( 'link', { name: 'Update your details' } );
	setAgency( {
		...makeAgency(),
		profile: { ...makeAgencyProfile( false ), partner_directory_application: null },
	} );
	await waitFor( () => expect( announcement() ).not.toBeInTheDocument() );
	setAgency( { ...makeAgency(), tier: undefined } );
	expect( announcement() ).not.toBeInTheDocument();
	setAgency( { ...makeAgency(), partner_directory: { allowed: false } } );
	expect( announcement() ).not.toBeInTheDocument();
	setAgency( makeAgency( 'pro-agency-partner' ) );
	expect( await screen.findByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
	expect( matchingRead.isDone() ).toBe( false );
} );
