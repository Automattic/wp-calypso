/**
 * Tests for RestAPIClient.deleteSite, focused on the ownership pre-check.
 *
 * The pre-check previously used a `.filter()` callback with no `return`, which
 * always produced an empty (truthy) array, so the `if ( ! match )` guard never
 * fired and deletion proceeded for any `e2e`-prefixed domain. These tests pin
 * the fixed `.some()` behavior: delete only when the target is among the user's
 * own domains.
 */
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import nock from 'nock';
import { RestAPIClient, BEARER_TOKEN_URL } from '../rest-api-client';
import { SecretsManager } from '../secrets';
import type { Secrets } from '../secrets';

const fakeSecrets = {
	calypsoOauthApplication: {
		client_id: 'some_value',
		client_secret: 'some_value',
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

// Persist and intercept all bearer token calls in these tests.
nock( BEARER_TOKEN_URL )
	.persist()
	.post( /.*/ )
	.reply( 200, {
		success: true,
		data: {
			bearer_token: 'abcdefghijklmn',
			token_links: [ 'link_1', 'link_2' ],
		},
	} );

describe( 'RestAPIClient: deleteSite', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );

	const targetSite = { id: 12345, domain: 'e2eflowtesting12345.wordpress.com' };
	const allDomainsURL = restAPIClient.getRequestURL( '1.1', '/all-domains/' );
	const deleteURL = restAPIClient.getRequestURL( '1.1', `/sites/${ targetSite.id }/delete` );

	beforeEach( function () {
		nock.cleanAll();
		// Re-persist the bearer token endpoint after cleanAll.
		nock( BEARER_TOKEN_URL )
			.persist()
			.post( /.*/ )
			.reply( 200, {
				success: true,
				data: { bearer_token: 'abcdefghijklmn', token_links: [] },
			} );
	} );

	test( 'deletes a site that belongs to the user', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				domains: [
					{ blog_id: targetSite.id, domain: targetSite.domain },
					{ blog_id: 99999, domain: 'e2eflowtestingother.wordpress.com' },
				],
			} );

		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( targetSite );

		expect( deleteScope.isDone() ).toBe( true );
		expect( response ).not.toBeNull();
		expect( response?.status ).toBe( 'deleted' );
	} );

	test( 'aborts and returns null when the site is not owned by the user', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				// Target site is absent: only an unrelated domain is owned.
				domains: [ { blog_id: 99999, domain: 'e2eflowtestingother.wordpress.com' } ],
			} );

		// Register the delete endpoint so we can assert it is NOT called.
		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( targetSite );

		expect( response ).toBeNull();
		expect( deleteScope.isDone() ).toBe( false );
	} );

	test( 'aborts when only the blog_id matches but the domain differs', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				domains: [ { blog_id: targetSite.id, domain: 'e2eflowtestingDIFFERENT.wordpress.com' } ],
			} );

		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( targetSite );

		expect( response ).toBeNull();
		expect( deleteScope.isDone() ).toBe( false );
	} );

	test( 'returns null for a non-e2e domain without querying domains', async function () {
		// No /all-domains/ interceptor: if the method queried it, nock would error.
		const response = await restAPIClient.deleteSite( {
			id: 777,
			domain: 'realsite.wordpress.com',
		} );

		expect( response ).toBeNull();
	} );

	test( 'strips an http:// scheme before matching ownership', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				domains: [ { blog_id: targetSite.id, domain: targetSite.domain } ],
			} );

		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( {
			id: targetSite.id,
			domain: `http://${ targetSite.domain }`,
		} );

		expect( deleteScope.isDone() ).toBe( true );
		expect( response?.status ).toBe( 'deleted' );
	} );

	test( 'strips an https:// scheme (the create-site blog_details.url form) before matching ownership', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				domains: [ { blog_id: targetSite.id, domain: targetSite.domain } ],
			} );

		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( {
			id: targetSite.id,
			domain: `https://${ targetSite.domain }/`,
		} );

		expect( deleteScope.isDone() ).toBe( true );
		expect( response?.status ).toBe( 'deleted' );
	} );

	test( 'matches ownership case-insensitively', async function () {
		nock( allDomainsURL.origin )
			.get( allDomainsURL.pathname )
			.reply( 200, {
				// `/all-domains/` casing differs from the caller-passed domain.
				domains: [ { blog_id: targetSite.id, domain: 'E2EFlowTesting12345.WordPress.com' } ],
			} );

		const deleteScope = nock( deleteURL.origin )
			.post( deleteURL.pathname )
			.reply( 200, { status: 'deleted' } );

		const response = await restAPIClient.deleteSite( targetSite );

		expect( deleteScope.isDone() ).toBe( true );
		expect( response?.status ).toBe( 'deleted' );
	} );
} );
