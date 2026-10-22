/**
 * @jest-environment jsdom
 */

import { agencyPendingSitesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { jumpToWizardStep, setPreviewPreset } from '../../design-preview';
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
		const checkMockConnection = async () => {
			expect(
				screen.getByRole( 'heading', { name: /^Waiting for your sites? to connect$/ } )
			).toHaveFocus();
			expect( screen.queryByRole( 'button', { name: 'View sites' } ) ).not.toBeInTheDocument();
			await click( 'Check connection' );
			expect( screen.getByRole( 'button', { name: 'Check connection' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
			expect( await screen.findByText( 'Not connected yet' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Check again' } ) ).toHaveFocus();
			await click( 'Check again' );
			await screen.findByRole( 'button', { name: 'View sites' } );
		};
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

		test.each( [
			[ 'Connect a site', 'Bring your sites together' ],
			[ 'Move a site', 'Which sites are you moving?' ],
		] )( 'focuses the URL input with step context after choosing %s', async ( choice, title ) => {
			const user = userEvent.setup();
			render( <AgencySites /> );
			const card = await screen.findByRole( 'button', { name: new RegExp( `^${ choice }` ) } );
			card.focus();
			await user.keyboard( '{Enter}' );
			const input = screen.getByRole( 'textbox', { name: 'Site addresses' } );
			expect( input ).toHaveFocus();
			expect( input ).toHaveAccessibleDescription(
				expect.stringContaining( `${ title } Enter an address or paste a list.` )
			);
			await user.keyboard( 'client.example' );
			expect( input ).toHaveValue( 'client.example' );
			await user.tab();
			expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveFocus();
			await user.tab( { shift: true } );
			await user.keyboard( '{End}{Control>}{Enter}{/Control}' );
			expect( input ).toHaveFocus();
			expect( input ).toHaveValue( 'client.example\n' );
		} );

		test( 'connects multiple account sites, keeps the success screen, and excludes them next time', async () => {
			render( <AgencySites /> );
			await openConnection();
			await click( /^Choose from WordPress.com/ );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'Automattic' } ) );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'Jetpack' } ) );
			await click( 'Add selected sites' );
			expect( screen.getByRole( 'heading', { name: '2 sites connected' } ) ).toBeVisible();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Automattic/ } ) ).toBeVisible();
			expect( screen.getByRole( 'row', { name: /Jetpack/ } ) ).toBeVisible();
			await click( 'Add new site' );
			await openConnection();
			await click( /^Choose from WordPress.com/ );
			expect( screen.queryByRole( 'checkbox', { name: 'Automattic' } ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'checkbox', { name: 'WooCommerce' } ) ).toBeVisible();
		} );

		test.each( [ 'a4a', 'jetpack' ] )( 'connects another site using %s', async ( plugin ) => {
			render( <AgencySites /> );
			await openConnection();
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'client.example.com' );
			await click( 'Continue' );
			expect(
				screen.getByRole( 'heading', { name: 'Install the plugin to connect' } )
			).toHaveFocus();
			expect( screen.getAllByText( 'client.example.com' ) ).toHaveLength( 1 );
			expect( screen.queryByRole( 'radio' ) ).not.toBeInTheDocument();
			for ( const title of [ 'Automattic for Agencies', 'Jetpack' ] ) {
				const features = within( screen.getByRole( 'list', { name: `${ title } features` } ) );
				expect( screen.getByRole( 'button', { name: new RegExp( `^${ title }` ) } ) ).toBeVisible();
				expect(
					features.getByRole( 'button', { name: 'Approve your agency account : Included' } )
				).toBeVisible();
				expect(
					features.getByRole( 'button', {
						name:
							title === 'Jetpack'
								? 'Install through Jetpack : Included'
								: 'Install and activate in WordPress : Included',
					} )
				).toBeVisible();
			}
			expect(
				screen.queryByRole( 'heading', { name: /^Install and activate/ } )
			).not.toBeInTheDocument();
			const card = screen.getByRole( 'button', {
				name: plugin === 'a4a' ? /^Automattic for Agencies/ : /^Jetpack/,
			} );
			card.focus();
			await userEvent.keyboard( '{Enter}' );
			expect(
				screen.getByRole( 'heading', {
					name: `Install and activate ${ plugin === 'a4a' ? 'Automattic for Agencies' : 'Jetpack' }`,
				} )
			).toBeVisible();
			await checkMockConnection();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /client.example.com/ } ) ).toBeVisible();
		} );

		test( 'recognizes an account site by its URL without asking for another plugin installation', async () => {
			render( <AgencySites /> );
			await openConnection();
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'https://automattic.com' );
			await click( 'Continue' );
			expect( screen.getByText( /already linked to your account/ ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: /^Automattic for Agencies/ } )
			).not.toBeInTheDocument();
			await click( 'Add to dashboard' );
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Automattic/ } ) ).toBeVisible();
		} );

		test( 'connects a chosen batch and keeps the remaining portfolio available', async () => {
			render( <AgencySites /> );
			await openConnection();
			act( () => jumpToWizardStep( { journey: 'connect', step: 'url' } ) );
			await click( 'Review sites' );
			expect( screen.getByText( '0 of 30 selected' ) ).toBeVisible();
			await click( 'Start with three' );
			await click( 'Continue with 3 sites' );
			await click( /^Automattic for Agencies/ );
			await checkMockConnection();
			expect( screen.getByRole( 'heading', { name: '3 sites connected' } ) ).toBeVisible();
			await click( 'Continue with remaining sites' );
			expect( screen.getByText( '0 of 27 selected' ) ).toBeVisible();
			expect( screen.getByRole( 'checkbox', { name: 'Juniper Studio' } ) ).toBeDisabled();
			await click( 'Start with three' );
			await click( 'Continue with 3 sites' );
			await click( /^Automattic for Agencies/ );
			await checkMockConnection();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Juniper Studio/ } ) ).toBeVisible();
			expect( screen.getByRole( 'row', { name: /Paper Plane/ } ) ).toBeVisible();
		} );

		test( 'reads a CSV upload and lets you select the extracted sites', async () => {
			render( <AgencySites /> );
			await openConnection();
			const file = new File(
				[ 'Client,Website\nJuniper,juniper.example\nFern,fern.example' ],
				'clients.csv',
				{ type: 'text/csv' }
			);
			Object.defineProperty( file, 'text', {
				value: () =>
					Promise.resolve( 'Client,Website\nJuniper,juniper.example\nFern,fern.example' ),
			} );
			await userEvent.upload( screen.getByLabelText( 'Upload a site list' ), file );
			await screen.findByText( 'Added clients.csv. Review or edit the addresses above.' );
			await click( 'Review sites' );
			expect( screen.getByRole( 'checkbox', { name: 'Juniper' } ) ).toBeVisible();
			expect( screen.getByRole( 'checkbox', { name: 'Fern' } ) ).toBeVisible();
		} );

		test( 'keeps a small portfolio selected without large-list tools', async () => {
			render( <AgencySites /> );
			await openConnection();
			await userEvent.type(
				screen.getByLabelText( 'Site addresses' ),
				'one.example\ntwo.example\nthree.example\nfour.example\nfive.example'
			);
			await click( 'Review sites' );
			expect( screen.getByRole( 'button', { name: 'Continue with 5 sites' } ) ).toBeVisible();
			expect( screen.queryByRole( 'textbox', { name: 'Find a site' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Select all' } ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Start with three' } )
			).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Clear selection' } ) ).not.toBeInTheDocument();
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'five.example' } ) );
			await click( 'Continue with 4 sites' );
			await click( 'Back' );
			expect( await screen.findByRole( 'checkbox', { name: 'five.example' } ) ).not.toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'one.example' } ) ).toBeChecked();
		} );

		test( 'browser Back and Forward restore steps, input, selections, and a completed flow', async () => {
			const { router } = render( <AgencySites /> );
			await openConnection();
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'one.example\ntwo.example' );
			await click( 'Review sites' );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'two.example' } ) );
			await click( 'Continue with 1 site' );
			act( () => router.history.back() );
			expect( await screen.findByRole( 'checkbox', { name: 'one.example' } ) ).toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'two.example' } ) ).not.toBeChecked();
			act( () => router.history.back() );
			expect( await screen.findByLabelText( 'Site addresses' ) ).toHaveValue(
				'one.example\ntwo.example'
			);
			act( () => router.history.forward() );
			await screen.findByRole( 'checkbox', { name: 'one.example' } );
			act( () => router.history.forward() );
			await click( /^Jetpack/ );
			await click( 'Check connection' );
			await screen.findByText( 'Not connected yet' );
			act( () => router.history.back() );
			expect( await screen.findByRole( 'button', { name: /^Jetpack/ } ) ).toBeVisible();
			act( () => router.history.forward() );
			expect(
				await screen.findByRole( 'heading', { name: 'Install and activate Jetpack' } )
			).toBeVisible();
			await click( 'Check again' );
			await click( 'View sites' );
			await screen.findByRole( 'row', { name: /one.example/ } );
			act( () => router.history.back() );
			expect(
				await screen.findByRole( 'heading', { name: 'Your site is connected' } )
			).toBeVisible();
		} );

		test.each( [
			[ 'missing', 'page' ],
			[ 'missing', 'browser' ],
			[ 'uncached', 'page' ],
			[ 'uncached', 'browser' ],
		] )(
			'returns to the empty state with a %s history entry and the %s Back button',
			async ( entry, button ) => {
				const { router } = render( <AgencySites /> );
				await openConnection();
				await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'client.example' );
				act( () => router.history.back() );
				await screen.findByRole( 'heading', { name: 'Add your first site' } );

				// A route update can remove the marker; a hot update can clear its in-memory entry.
				act( () => {
					const { href, state } = router.history.location;
					router.history.replace( href, {
						...state,
						agencySiteWizard:
							entry === 'missing'
								? undefined
								: { ...state.agencySiteWizard!, id: 'uncached-start' },
					} );
					router.history.flush();
					router.history.forward();
				} );
				expect( await screen.findByLabelText( 'Site addresses' ) ).toHaveValue( 'client.example' );

				if ( button === 'page' ) {
					await click( 'Back' );
				} else {
					act( () => router.history.back() );
				}
				expect(
					await screen.findByRole( 'heading', { name: 'Add your first site' } )
				).toBeVisible();
				expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();

				act( () => router.history.forward() );
				expect( await screen.findByLabelText( 'Site addresses' ) ).toHaveValue( 'client.example' );
				await click( 'Back' );
				await screen.findByRole( 'heading', { name: 'Add your first site' } );
				await openConnection();
				expect( screen.getByLabelText( 'Site addresses' ) ).toHaveValue( 'client.example' );
			}
		);

		test( 'moves only selected sites from a pasted spreadsheet', async () => {
			render( <AgencySites /> );
			await click( /^Move a site/ );
			await userEvent.type(
				screen.getByLabelText( 'Site addresses' ),
				'Alpha\talpha.example\nBeta\tbeta.example\nLater\tlater.example'
			);
			await click( 'Review sites' );
			await userEvent.click( screen.getByRole( 'checkbox', { name: 'Later' } ) );
			await click( 'Continue with 2 sites' );
			await click( /^Pressable/ );
			await click( /^Move it for me/ );
			await click( 'Request migration' );
			await click( 'Check migration status' );
			await click( 'Confirm and connect 2 domains' );
			expect( screen.getByRole( 'heading', { name: '2 sites moved' } ) ).toBeVisible();
			await click( 'View sites' );
			expect( await screen.findByRole( 'row', { name: /Alpha/ } ) ).toBeVisible();
			expect( screen.getByRole( 'row', { name: /Beta/ } ) ).toBeVisible();
			expect( screen.queryByRole( 'row', { name: /later.example/ } ) ).not.toBeInTheDocument();
		} );

		test( 'jumps from the live site list into a seeded sample flow with working Back', async () => {
			setPreviewPreset( 'sites', 'live' );
			render( <AgencySites /> );
			await screen.findByRole( 'row', { name: /First/ } );
			act( () =>
				jumpToWizardStep( { journey: 'migrate', step: 'setup', method: 'self', host: 'pressable' } )
			);
			expect(
				await screen.findByRole( 'heading', { name: 'Arrange your migration' } )
			).toBeVisible();
			expect( screen.getByText( /Your websites will be hosted on Pressable/ ) ).toBeVisible();
			await click( 'Back' );
			expect(
				await screen.findByRole( 'heading', { name: 'Who should handle the move?' } )
			).toBeVisible();
			act( () => jumpToWizardStep( { journey: 'development', step: 'setup' } ) );
			await click( 'Create site' );
			expect(
				screen.getByRole( 'heading', { name: 'Your development site is ready' } )
			).toBeVisible();
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
				await click( new RegExp( `^${ host }` ) );
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
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'moving.example.com' );
			await click( 'Continue' );
			await click( new RegExp( `^${ host }` ) );
			await click( new RegExp( `^${ method }` ) );
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
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t find any website addresses'
			);
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'client.example.com' );
			await click( 'Continue' );
			await click( 'Back' );
			expect( await screen.findByLabelText( 'Site addresses' ) ).toHaveValue(
				'client.example.com'
			);
			await click( 'Back' );
			expect( screen.getByRole( 'heading', { name: 'Add your first site' } ) ).toBeVisible();
			await openConnection();
			expect( screen.getByLabelText( 'Site addresses' ) ).toHaveValue( 'client.example.com' );
		} );

		test( 'resets the wizard on a persona switch, including switching back to live data', async () => {
			render( <AgencySites /> );
			await click( /^Connect a site/ );
			act( () => setPreviewPreset( 'sites', 'live' ) );
			expect( await screen.findByRole( 'row', { name: /First/ } ) ).toBeVisible();
			act( () => setPreviewPreset( 'sites', '0' ) );
			expect( await screen.findByRole( 'heading', { name: 'Add your first site' } ) ).toBeVisible();
		} );

		test( 'skips review for one URL and lets you revise immediate choices with Back', async () => {
			render( <AgencySites /> );
			await click( /^Move a site/ );
			await userEvent.type( screen.getByLabelText( 'Site addresses' ), 'moving.example.com' );
			await click( 'Continue' );
			expect( screen.getByRole( 'heading', { name: 'Choose your hosting' } ) ).toHaveFocus();
			expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
			await click( /^Pressable/ );
			expect(
				screen.getByRole( 'heading', { name: 'Who should handle the move?' } )
			).toHaveFocus();
			await click( 'Back' );
			await click( /^WordPress.com/ );
			await click( /^I’ll move it myself/ );
			expect( screen.getByRole( 'button', { name: 'Copy site' } ) ).toBeVisible();
			expect( screen.getByText( /Your website will be hosted on WordPress.com/ ) ).toBeVisible();
			await click( 'Back' );
			await click( /^Move it for me/ );
			expect( screen.getByRole( 'button', { name: 'Request migration' } ) ).toBeVisible();
			await click( 'Back' );
			await screen.findByRole( 'heading', { name: 'Who should handle the move?' } );
			await click( 'Back' );
			await screen.findByRole( 'heading', { name: 'Choose your hosting' } );
			await click( 'Back' );
			expect( await screen.findByLabelText( 'Site addresses' ) ).toHaveValue(
				'moving.example.com'
			);
		} );
	} );

	test( 'shows three entry choices with no table controls for an empty agency', async () => {
		mockEndpoints( [], [] );
		render( <AgencySites /> );
		expect( await screen.findByRole( 'button', { name: /^Connect a site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Create a site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Move a site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Sites', level: 1 } ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Search' ) ).not.toBeInTheDocument();
	} );

	test( 'opens the wizard in the page for a populated agency', async () => {
		mockEndpoints();
		const { recordTracksEvent } = render( <AgencySites /> );
		await userEvent.click( await addNewSiteButton() );
		expect( screen.getByRole( 'heading', { name: 'Sites', level: 1 } ) ).toBeVisible();
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
