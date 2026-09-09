/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ConnectRepository from '../connect-repository';
import type { AnalyticsClient } from '../../../app/analytics';
import type { Site } from '@automattic/api-core';

const POPUP_EVENT = 'calypso_hosting_github_app_open_auth_popup_requested';
const INSTALL_FAILED_EVENT = 'calypso_hosting_github_app_install_failed';
const SUCCESS_EVENT = 'calypso_hosting_github_create_deployment_success';
const FAILURE_EVENT = 'calypso_hosting_github_create_deployment_failure';

const API_BASE = 'https://public-api.wordpress.com';
const site = { ID: 1, slug: 'test-site' } as Site;
const installation = { external_id: 100, account_name: 'test-org' };
const repository = {
	id: 10,
	owner: 'test-org',
	name: 'test-repo',
	default_branch: 'main',
	private: false,
};

jest.mock( '../../../app/router/sites', () => {
	const actual = jest.requireActual( '../../../app/router/sites' );
	return {
		...actual,
		siteRoute: {
			...actual.siteRoute,
			useParams: () => ( { siteSlug: 'test-site' } ),
		},
	};
} );

function mockApis( { installations = [] }: { installations?: object[] } = {} ) {
	nock( API_BASE ).get( `/rest/v1.1/sites/${ site.slug }` ).query( true ).reply( 200, site );
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/installations' )
		.query( true )
		.reply( 200, installations )
		.persist();
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` )
		.reply( 200, [] )
		.persist();
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/repositories' )
		.query( true )
		.reply( 200, [ repository ] )
		.persist();
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/repository/branches' )
		.query( true )
		.reply( 200, [ 'main' ] )
		.persist();
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/repository/pre-connect-checks' )
		.query( true )
		.reply( 200, { suggested_directory: '/wp-content/plugins/test-repo' } )
		.persist();
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/workflows' )
		.query( true )
		.reply( 200, [] )
		.persist();
}

function eventCalls( recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ], name: string ) {
	return ( recordTracksEvent as jest.Mock ).mock.calls.filter( ( [ event ] ) => event === name );
}

async function selectRepositoryAndSubmit( user: ReturnType< typeof userEvent.setup > ) {
	// The repository list only populates once the repositories query resolves.
	await screen.findByText( /Missing GitHub repositories/ );

	await user.click( screen.getByRole( 'combobox', { name: 'Repository' } ) );
	await user.keyboard( '{ArrowDown}{Enter}' );

	const button = await screen.findByRole( 'button', { name: 'Connect Repository' } );
	await waitFor( () => expect( button ).toBeEnabled() );
	await user.click( button );
}

describe( '<ConnectRepository>', () => {
	beforeEach( () => {
		// A blocked popup: window.open returns null rather than throwing.
		jest.spyOn( window, 'open' ).mockReturnValue( null );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test( 'does not record the auth popup event on render', async () => {
		mockApis();
		const { recordTracksEvent } = render( <ConnectRepository /> );

		await screen.findByRole( 'button', { name: 'Add GitHub account' } );

		expect( eventCalls( recordTracksEvent, POPUP_EVENT ) ).toHaveLength( 0 );
	} );

	test( 'records the auth popup event once per install click', async () => {
		mockApis();
		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConnectRepository /> );

		await user.click( await screen.findByRole( 'button', { name: 'Add GitHub account' } ) );

		expect( eventCalls( recordTracksEvent, POPUP_EVENT ) ).toHaveLength( 1 );
	} );

	test( 'names the repository field for assistive technology', async () => {
		mockApis();
		render( <ConnectRepository /> );

		expect( await screen.findByRole( 'combobox', { name: 'Repository' } ) ).toBeVisible();
	} );

	test( 'reports the install as failed when the popup is blocked', async () => {
		mockApis();
		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConnectRepository /> );

		await user.click( await screen.findByRole( 'button', { name: 'Add GitHub account' } ) );

		expect( eventCalls( recordTracksEvent, INSTALL_FAILED_EVENT ) ).toHaveLength( 1 );
	} );

	test( 'records the deployment type from the API response on success', async () => {
		mockApis( { installations: [ installation ] } );
		nock( API_BASE ).post( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` ).reply( 200, {
			message: 'Connected',
			target_dir: '/wp-content/plugins/test-repo',
			is_automated: false,
		} );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConnectRepository /> );
		await selectRepositoryAndSubmit( user );

		await waitFor( () =>
			expect( eventCalls( recordTracksEvent, SUCCESS_EVENT ) ).toHaveLength( 1 )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( SUCCESS_EVENT, {
			deployment_type: 'plugin',
			is_automated: false,
			workflow_path: undefined,
		} );
	} );

	test( 'records the API error code as the failure reason', async () => {
		mockApis( { installations: [ installation ] } );
		nock( API_BASE )
			.post( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` )
			.reply( 400, { code: 'duplicate_deployment', message: 'Branch already connected.' } );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConnectRepository /> );
		await selectRepositoryAndSubmit( user );

		await waitFor( () =>
			expect( eventCalls( recordTracksEvent, FAILURE_EVENT ) ).toHaveLength( 1 )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( FAILURE_EVENT, {
			reason: 'duplicate_deployment',
		} );
	} );

	test( 'leaves the failure reason unset when the API error has no code', async () => {
		mockApis( { installations: [ installation ] } );
		nock( API_BASE )
			.post( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` )
			.reply( 500, { message: 'Internal server error.' } );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConnectRepository /> );
		await selectRepositoryAndSubmit( user );

		await waitFor( () =>
			expect( eventCalls( recordTracksEvent, FAILURE_EVENT ) ).toHaveLength( 1 )
		);
		const [ , properties ] = eventCalls( recordTracksEvent, FAILURE_EVENT )[ 0 ];
		expect( properties.reason ).toBeUndefined();
		expect( eventCalls( recordTracksEvent, SUCCESS_EVENT ) ).toHaveLength( 0 );
	} );
} );
