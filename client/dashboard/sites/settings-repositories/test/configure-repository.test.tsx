/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ConfigureRepository from '../configure-repository';
import type { AnalyticsClient } from '../../../app/analytics';
import type { CodeDeploymentData, Site } from '@automattic/api-core';

const SUCCESS_EVENT = 'calypso_hosting_github_update_deployment_success';
const FAILURE_EVENT = 'calypso_hosting_github_update_deployment_failure';

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
const deployment = {
	id: 5,
	external_repository_id: repository.id,
	branch_name: 'main',
	target_dir: '/wp-content/plugins/test-repo',
	is_automated: false,
	installation_id: installation.external_id,
} as CodeDeploymentData;

jest.mock( '@tanstack/react-router', () => {
	const actual = jest.requireActual( '@tanstack/react-router' );
	return {
		...actual,
		useParams: () => ( { siteSlug: 'test-site', deploymentId: 5 } ),
	};
} );

function mockApis() {
	nock( API_BASE ).get( `/rest/v1.1/sites/${ site.slug }` ).query( true ).reply( 200, site );
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments/${ deployment.id }` )
		.reply( 200, deployment );
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` )
		.reply( 200, [ deployment ] )
		.persist();
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/installations' )
		.query( true )
		.reply( 200, [ installation ] )
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
		.reply( 200, { suggested_directory: deployment.target_dir } )
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

async function submit( user: ReturnType< typeof userEvent.setup > ) {
	const button = await screen.findByRole( 'button', { name: 'Update Connection' } );
	await waitFor( () => expect( button ).toBeEnabled() );
	await user.click( button );
}

describe( '<ConfigureRepository>', () => {
	test( 'records the deployment type from the API response on success', async () => {
		mockApis();
		nock( API_BASE )
			// wpcom.req.put() is tunnelled over HTTP POST.
			.post( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments/${ deployment.id }` )
			.reply( 200, {
				message: 'Updated',
				target_dir: '/wp-content/themes/test-theme',
				is_automated: true,
			} );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConfigureRepository /> );
		await submit( user );

		await waitFor( () =>
			expect( eventCalls( recordTracksEvent, SUCCESS_EVENT ) ).toHaveLength( 1 )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( SUCCESS_EVENT, {
			deployment_type: 'theme',
			is_automated: true,
			workflow_path: undefined,
		} );
	} );

	test( 'records the API error code as the failure reason', async () => {
		mockApis();
		nock( API_BASE )
			// wpcom.req.put() is tunnelled over HTTP POST.
			.post( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments/${ deployment.id }` )
			.reply( 400, { code: 'duplicate_deployment', message: 'Branch already connected.' } );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ConfigureRepository /> );
		await submit( user );

		await waitFor( () =>
			expect( eventCalls( recordTracksEvent, FAILURE_EVENT ) ).toHaveLength( 1 )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( FAILURE_EVENT, {
			reason: 'duplicate_deployment',
		} );
	} );
} );
