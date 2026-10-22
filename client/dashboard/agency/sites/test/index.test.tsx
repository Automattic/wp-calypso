/**
 * @jest-environment jsdom
 */

import { agencyPendingSitesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { setPreviewPreset } from '../../design-preview';
import AgencySites from '../index';
import type { AgencySite } from '@automattic/api-core';

jest.mock( '../../design-preview', () => {
	const actual = jest.requireActual( '../../design-preview' );
	return {
		...actual,
		__esModule: true,
		useDesignPreview: () => {
			const state = actual.useDesignPreview();
			return { ...state, sitesActive: state.sites !== 'live' };
		},
	};
} );

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const mockSites = [
	{ blog_id: 1, a4a_site_id: 1, url: 'first.example.com', blogname: 'First' },
	{
		blog_id: 2,
		a4a_site_id: 2,
		url: 'second.example.com',
		blogname: 'Second',
		a4a_is_dev_site: true,
	},
] as AgencySite[];

function pendingSite( id: number, state: string, licenseKey = 'wpcom-hosting-business_abc' ) {
	return { id, features: { wpcom_atomic: { license_key: licenseKey, state } } };
}

function mockEndpoints( pendingSites: unknown[] = [], sites: AgencySite[] = mockSites ) {
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: 'approved' } ] );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites, total: sites.length, perPage: 50, totalPages: 1 } );

	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` )
		.reply( 200, pendingSites );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/jetpack-licensing/dev-licenses' )
		.query( true )
		.reply( 200, { licenses: [], available: 5 } );

	// Seed the address the site configuration modal opens with.
	nock( BASE )
		.persist()
		.get( '/wpcom/v2/site-suggestions' )
		.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
}

const addNewSiteButton = () => screen.findByRole( 'button', { name: 'Add new site' } );

describe( '<AgencySites>', () => {
	beforeEach( () => setPreviewPreset( 'sites', 'live' ) );

	describe( 'local site wizard', () => {
		let writes: string[];
		beforeEach( () => {
			mockEndpoints();
			setPreviewPreset( 'sites', '0' );
			writes = [];
			nock( BASE )
				.persist()
				.post( /.*/ )
				.reply( ( uri ) => {
					writes.push( uri );
					return [ 500, { message: 'Preview must not mutate the real account' } ];
				} );
		} );
		afterEach( () => {
			if ( writes.length ) {
				throw new Error( `Wizard sent live requests: ${ writes.join( ', ' ) }` );
			}
		} );

		const click = async ( name: string | RegExp ) =>
			userEvent.click( await screen.findByRole( 'button', { name } ) );
		const openConnection = async () => click( /^Connect a site/ );
		const configureHosting = async ( billing: string ) => {
			if ( billing === 'existing' ) {
				await userEvent.click(
					screen.getByRole( 'checkbox', {
						name: /Use my unused WordPress.com plan|Add this website to my existing Pressable plan/,
					} )
				);
			} else {
				await userEvent.click(
					screen.getByRole( 'radio', {
						name: billing === 'client' ? 'My client pays' : 'My agency pays',
					} )
				);
			}
			if ( billing === 'client' ) {
				await userEvent.type( screen.getByLabelText( 'Client email' ), 'client@example.com' );
			}
		};
		const submitSetup = async ( billing: string, label: string ) => {
			if ( billing === 'client' ) {
				await click( 'Send referral' );
				await screen.findByRole( 'heading', { name: 'Your referral has been sent' } );
				await click( 'Check purchase status' );
			} else {
				await click( label );
			}
		};

		test( 'connects multiple account sites, keeps the success screen, and excludes them next time', async () => {
			render( <AgencySites /> );
			await openConnection();
			await click( /^Choose sites from my account/ );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'Automattic' } ) );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'Jetpack' } ) );
			await click( 'Connect selected sites' );
			expect( screen.getByRole( 'heading', { name: '2 sites connected' } ) ).toBeVisible();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Automattic/ } ) ).toBeVisible();
			expect( screen.getByRole( 'row', { name: /Jetpack/ } ) ).toBeVisible();
			await click( 'Add new site' );
			await openConnection();
			await click( /^Choose sites from my account/ );
			expect( screen.queryByRole( 'checkbox', { name: 'Automattic' } ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'checkbox', { name: 'WooCommerce' } ) ).toBeVisible();
		} );

		test.each( [ 'a4a', 'jetpack' ] )( 'connects another site using %s', async ( plugin ) => {
			render( <AgencySites /> );
			await openConnection();
			await userEvent.type( screen.getByLabelText( 'Site address' ), 'client.example.com' );
			await click( 'Continue' );
			if ( plugin === 'jetpack' ) {
				await userEvent.click( screen.getByText( 'Connection options' ) );
				await userEvent.click( screen.getByRole( 'radio', { name: /^Jetpack/ } ) );
			}
			await click( 'Approve connection' );
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /client.example.com/ } ) ).toBeVisible();
		} );

		test( 'recognizes an account site by its URL without asking for another plugin installation', async () => {
			render( <AgencySites /> );
			await openConnection();
			await userEvent.type( screen.getByLabelText( 'Site address' ), 'https://automattic.com' );
			await click( 'Continue' );
			expect(
				screen.getByText( /already associated with your WordPress.com account/ )
			).toBeVisible();
			expect( screen.queryByText( 'Connection options' ) ).not.toBeInTheDocument();
			await click( 'Approve connection' );
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Automattic/ } ) ).toBeVisible();
		} );

		test( 'creates a development site and returns to the list from success', async () => {
			render( <AgencySites /> );
			await click( /^Create a site/ );
			await click( /^Development site/ );
			await userEvent.clear( screen.getByLabelText( 'Site address' ) );
			await userEvent.type( screen.getByLabelText( 'Site address' ), 'localclient' );
			await click( 'Create site' );
			expect(
				screen.getByRole( 'heading', { name: 'Your development site is ready' } )
			).toBeVisible();
			await click( 'View sites' );
			const row = await screen.findByRole( 'row', { name: /localclient/ } );
			expect( within( row ).getByText( 'Development' ) ).toBeVisible();
		} );

		const hosts = [ 'WordPress.com', 'Pressable' ];
		const billings = [ 'existing', 'agency', 'client' ];
		test.each( hosts.flatMap( ( host ) => billings.map( ( billing ) => [ host, billing ] ) ) )(
			'creates a hosted site on %s with %s',
			async ( host, billing ) => {
				render( <AgencySites /> );
				await click( /^Create a site/ );
				await click( /^Production site/ );
				await userEvent.click( screen.getByRole( 'radio', { name: host } ) );
				await click( 'Continue' );
				await configureHosting( billing );
				await userEvent.type( screen.getByLabelText( 'Site name' ), 'Client portfolio' );
				await submitSetup( billing, 'Create site' );
				await click( 'View sites' );
				expect( await screen.findByRole( 'row', { name: /Client portfolio/ } ) ).toBeVisible();
			}
		);

		test.each(
			hosts.flatMap( ( host ) =>
				[ 'Move it for me', 'I’ll move it myself' ].flatMap( ( method ) =>
					billings.map( ( billing ) => [ host, method, billing ] )
				)
			)
		)( 'migrates to %s via %s with %s', async ( host, method, billing ) => {
			render( <AgencySites /> );
			await click( /^Move a site/ );
			await userEvent.type( screen.getByLabelText( 'Site address' ), 'moving.example.com' );
			await click( 'Continue' );
			await userEvent.click( screen.getByRole( 'radio', { name: host } ) );
			await userEvent.click( screen.getByRole( 'radio', { name: method } ) );
			await click( 'Continue' );
			await configureHosting( billing );
			await submitSetup( billing, method === 'Move it for me' ? 'Request migration' : 'Copy site' );
			if ( method === 'Move it for me' ) {
				await screen.findByRole( 'heading', { name: 'Your migration has been requested' } );
				await click( 'Check migration status' );
			}
			await click( 'Confirm and connect domain' );
			expect( screen.getByRole( 'heading', { name: 'Your migration is complete' } ) ).toBeVisible();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /moving.example.com/ } ) ).toBeVisible();
		} );

		test( 'validates input and keeps the URL when navigating backward', async () => {
			render( <AgencySites /> );
			await openConnection();
			await click( 'Continue' );
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Enter a valid website address' );
			await userEvent.type( screen.getByLabelText( 'Site address' ), 'client.example.com' );
			await click( 'Continue' );
			await click( 'Back' );
			expect( screen.getByLabelText( 'Site address' ) ).toHaveValue( 'client.example.com' );
			await click( 'Back' );
			expect( screen.getByRole( 'heading', { name: 'Add your first site' } ) ).toBeVisible();
			await openConnection();
			expect( screen.getByLabelText( 'Site address' ) ).toHaveValue( 'client.example.com' );
		} );

		test( 'resets the wizard on a persona switch, including switching back to live data', async () => {
			render( <AgencySites /> );
			await click( /^Connect a site/ );
			act( () => setPreviewPreset( 'sites', 'live' ) );
			expect( await screen.findByRole( 'row', { name: /First/ } ) ).toBeVisible();
			act( () => setPreviewPreset( 'sites', '0' ) );
			expect( await screen.findByRole( 'heading', { name: 'Add your first site' } ) ).toBeVisible();
		} );
	} );

	test( 'shows three entry choices with no table controls for an empty agency', async () => {
		mockEndpoints( [], [] );
		render( <AgencySites /> );
		expect( await screen.findByRole( 'button', { name: /^Connect a site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Create a site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Move a site/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Sites' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Search' ) ).not.toBeInTheDocument();
	} );

	test( 'opens the wizard in the page for a populated agency', async () => {
		mockEndpoints();
		const { recordTracksEvent } = render( <AgencySites /> );
		await userEvent.click( await addNewSiteButton() );
		expect( screen.getByRole( 'button', { name: /^Connect a site/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_sites_add_new_site_clicked' );
	} );

	test( 'marks a development site in the list', async () => {
		mockEndpoints();

		render( <AgencySites /> );

		const devRow = await screen.findByRole( 'row', { name: /Second/ } );
		expect( within( devRow ).getByText( 'Development' ) ).toBeVisible();
		expect(
			within( screen.getByRole( 'row', { name: /First/ } ) ).queryByText( 'Development' )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the real development setup available in live mode', async () => {
		mockEndpoints();
		render( <AgencySites /> );
		await userEvent.click( await addNewSiteButton() );
		await userEvent.click( screen.getByRole( 'button', { name: /^Create a site/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /^Development site/ } ) );
		expect(
			await screen.findByRole( 'dialog', { name: 'Configure your new site' } )
		).toBeVisible();
	} );

	test( 'points licenses waiting to be set up at the unassigned Purchases filter', async () => {
		mockEndpoints( [
			pendingSite( 7, 'pending' ),
			pendingSite( 8, 'pending', 'wpcom-hosting-x_def' ),
		] );

		render( <AgencySites /> );

		expect(
			await screen.findByText( /2 WordPress\.com licenses are ready to set up/ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set them up in Purchases' } ) ).toHaveAttribute(
			'href',
			'/purchases?status=unassigned&search=WordPress.com'
		);
	} );

	// The header counts on every /sites load, so it must not take the route down
	// when the endpoint answers with something other than the expected list.
	test( 'survives a response that is not a list of pending sites', async () => {
		mockEndpoints( { error: 'unauthorized' } as unknown as unknown[] );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		render( <AgencySites />, { queryClient } );

		// Assert against the cache rather than the screen: the header renders
		// before the payload lands, so waiting on it would pass either way.
		await waitFor( () =>
			expect( queryClient.getQueryData( agencyPendingSitesQuery( AGENCY_ID ).queryKey ) ).toEqual( {
				error: 'unauthorized',
			} )
		);

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );

	test( 'says nothing when every license already has its site', async () => {
		mockEndpoints( [ pendingSite( 7, 'provisioning' ) ] );

		render( <AgencySites /> );

		await screen.findByRole( 'heading', { name: 'Sites' } );
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );
} );
