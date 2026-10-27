/**
 * @jest-environment jsdom
 */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ProvisioningSiteNotices from '../provisioning-notice';
import { trackProvisioningSite, untrackProvisioningSite } from '../provisioning-sites';

const API = 'https://public-api.wordpress.com';

function mockAgencySites( sites: unknown[] ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1 } ] );
	nock( API ).persist().get( '/wpcom/v2/agency/1/sites' ).reply( 200, sites );
}

function mockFeedbackPreference( feedback: Record< string, unknown > = {} ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: { 'a4a-feedback': feedback } } );
}

// The agency site list, which the site page needs before it can open a site.
function mockAgencySiteList( { hasSite }: { hasSite: boolean } ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/sites/site7.wordpress.com' )
		.query( true )
		.reply( 200, { ID: 77 } );
	nock( API )
		.persist()
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, hasSite ? { sites: [ { blog_id: 77 } ], total: 1 } : { sites: [], total: 0 } );
}

function provisionedSite( id: number, state: string ) {
	return { id, url: `site${ id }.wordpress.com`, features: { wpcom_atomic: { state } } };
}

describe( '<ProvisioningSiteNotices>', () => {
	// Wrapped: the untrack notifies the store, which re-renders a mounted notice.
	afterEach( () => {
		act( () => {
			untrackProvisioningSite( 7 );
			untrackProvisioningSite( 8 );
		} );
		window.history.replaceState( {}, '', '/' );
	} );

	test( 'says nothing when this browser started no sites', () => {
		mockAgencySites( [] );

		const { container } = render( <ProvisioningSiteNotices /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'reports a site that is still being created', async () => {
		mockAgencySites( [ provisionedSite( 7, 'provisioning' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Setting up your new WordPress.com site' ) ).toBeVisible();
	} );

	test( 'links to the site once it reports ready', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Your WordPress.com site is ready!' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set up your site' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/overview/site7.wordpress.com'
		);
		expect( screen.getByRole( 'link', { name: /site7\.wordpress\.com/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/overview/site7.wordpress.com'
		);
	} );

	test( 'opens the site in the dashboard once the agency site list has it', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		mockAgencySiteList( { hasSite: true } );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		await waitFor( () =>
			expect( screen.getByRole( 'link', { name: 'Set up your site' } ) ).toHaveAttribute(
				'href',
				'/sites/site7.wordpress.com'
			)
		);
	} );

	test( 'asks for feedback before opening the new site', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		mockAgencySiteList( { hasSite: true } );
		mockFeedbackPreference();
		trackProvisioningSite( 7 );

		const { router } = render( <ProvisioningSiteNotices /> );
		const link = await screen.findByRole( 'link', { name: 'Set up your site' } );
		await waitFor( () => expect( link ).toHaveAttribute( 'href', '/sites/site7.wordpress.com' ) );
		await userEvent.click( link );

		expect( await screen.findByRole( 'dialog', { name: 'Purchase complete!' } ) ).toBeVisible();
		expect( screen.queryByText( 'Your WordPress.com site is ready!' ) ).not.toBeInTheDocument();
		expect( router.state.location.pathname ).toBe( '/' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Skip' } ) );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/sites/site7.wordpress.com' )
		);
	} );

	test( 'asks for feedback on Sites while the agency site list lacks the site', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		mockAgencySiteList( { hasSite: false } );
		mockFeedbackPreference();
		trackProvisioningSite( 7 );

		const { router } = render( <ProvisioningSiteNotices /> );
		await userEvent.click( await screen.findByRole( 'link', { name: 'Set up your site' } ) );

		expect( await screen.findByRole( 'dialog', { name: 'Purchase complete!' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Skip' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( router.state.location.pathname ).toBe( '/' );
	} );

	test( 'does not ask a partner who already answered', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		mockAgencySiteList( { hasSite: true } );
		mockFeedbackPreference( { 'purchase-completed': { lastSkippedAt: 1757000000000 } } );
		trackProvisioningSite( 7 );

		const { router } = render( <ProvisioningSiteNotices /> );
		const link = await screen.findByRole( 'link', { name: 'Set up your site' } );
		await waitFor( () => expect( link ).toHaveAttribute( 'href', '/sites/site7.wordpress.com' ) );
		await userEvent.click( link );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/sites/site7.wordpress.com' )
		);
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'stops reporting a site once the notice is dismissed', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( 'Your WordPress.com site is ready!' ) ).not.toBeInTheDocument();
	} );

	test( 'gives up on a site that never reports ready', async () => {
		jest.useFakeTimers();
		mockAgencySites( [ provisionedSite( 7, 'provisioning' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Setting up your new WordPress.com site' ) ).toBeVisible();

		await act( async () => {
			jest.advanceTimersByTime( 5 * 60 * 1000 );
		} );

		expect(
			screen.queryByText( 'Setting up your new WordPress.com site' )
		).not.toBeInTheDocument();
		jest.useRealTimers();
	} );

	test( 'keeps reporting a site that reported ready before the TTL passed', async () => {
		jest.useFakeTimers();
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Your WordPress.com site is ready!' ) ).toBeVisible();

		await act( async () => {
			jest.advanceTimersByTime( 5 * 60 * 1000 );
		} );

		expect( screen.getByText( 'Your WordPress.com site is ready!' ) ).toBeVisible();
		jest.useRealTimers();
	} );

	// The banner renders on every /sites load, so it must not take the route down
	// when the endpoint answers with something other than the expected list.
	test( 'survives a response that is not a list of sites', async () => {
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 1 } ] );
		const scope = nock( API )
			.get( '/wpcom/v2/agency/1/sites' )
			.reply( 200, { error: 'unauthorized' } );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		// Re-render now that the bad payload is in the cache, so a render that
		// cannot survive it fails here rather than after the assertion.
		act( () => trackProvisioningSite( 8 ) );

		expect( screen.getAllByText( 'Setting up your new WordPress.com site' ) ).toHaveLength( 2 );
	} );
} );
