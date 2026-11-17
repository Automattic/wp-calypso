import useNock from 'calypso/test-helpers/use-nock';
import {
	domainsReceiveAction,
	domainsRequestAction,
	domainsRequestSuccessAction,
	domainsRequestFailureAction,
	fetchSiteDomains,
	setPrimaryDomain,
} from '../actions';
import {
	SITE_ID_FIRST as siteId,
	REST_API_RESPONSE as wpcomResponse,
	REST_API_ERROR_RESPONSE as wpcomErrorResponse,
	ACTION_SITE_DOMAIN_RECEIVE,
	ACTION_SITE_DOMAIN_REQUEST,
	ACTION_SITE_DOMAIN_REQUEST_SUCCESS,
	ACTION_SITE_DOMAIN_REQUEST_FAILURE,
	ERROR_MESSAGE_RESPONSE as errorResponse,
} from './fixture';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( 'Actions creators', () => {
		test( '#domainsReceiveAction()', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );
			expect( action ).toEqual( ACTION_SITE_DOMAIN_RECEIVE );
		} );

		test( '#domainsRequestAction()', () => {
			const action = domainsRequestAction( siteId );
			expect( action ).toEqual( ACTION_SITE_DOMAIN_REQUEST );
		} );

		test( '#domainsRequestSuccessAction()', () => {
			const action = domainsRequestSuccessAction( siteId );
			expect( action ).toEqual( ACTION_SITE_DOMAIN_REQUEST_SUCCESS );
		} );

		test( '#domainsRequestFailureAction()', () => {
			const action = domainsRequestFailureAction( siteId, errorResponse );
			expect( action ).toEqual( ACTION_SITE_DOMAIN_REQUEST_FAILURE );
		} );
	} );

	describe( '#fetchSiteDomains() - success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.2/sites/${ siteId }/domains` )
				.reply( 200, wpcomResponse );
		} );

		test( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = domainsRequestAction( siteId );
			fetchSiteDomains( siteId )( spy );
			expect( spy ).toHaveBeenCalledWith( action );
		} );

		test( 'should dispatch RECEIVE action when request completes', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );

			return fetchSiteDomains( siteId )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( action );
			} );
		} );
	} );

	describe( '#fetchSiteDomains() - failure', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.2/sites/${ siteId }/domains` )
				.reply( 403, wpcomErrorResponse );
		} );

		test( 'should dispatch REQUEST_FAILURE action when request failed', () => {
			const { message } = wpcomErrorResponse;
			const requestAction = domainsRequestAction( siteId );
			const failureAction = domainsRequestFailureAction( siteId, message );

			const promise = fetchSiteDomains( siteId )( spy );
			expect( spy ).toHaveBeenCalledWith( requestAction );

			return promise.then( () => {
				expect( spy ).toHaveBeenCalledWith( failureAction );
			} );
		} );
	} );

	describe( '#setPrimaryDomain()', () => {
		const ATOMIC_ERROR_MESSAGE =
			"We couldn't make this domain your primary domain. Please try again in a few minutes, or contact support if it keeps happening.";

		const useMockPrimaryDomainError = ( error, message ) =>
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( `/rest/v1.1/sites/${ siteId }/domains/primary` )
					.reply( 400, { error, message } );
			} );

		describe( 'when WP Cloud rejects the change', () => {
			useMockPrimaryDomainError( 'atomic_primary_domain_change_failed', ATOMIC_ERROR_MESSAGE );

			test( 'rejects with the API message and re-fetches the site and its domains', async () => {
				await expect( setPrimaryDomain( siteId, 'example.com' )( spy ) ).rejects.toThrow(
					ATOMIC_ERROR_MESSAGE
				);
				expect( spy ).toHaveBeenCalledWith( {
					type: 'DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_SAVE_FAILURE',
					siteId,
					domain: 'example.com',
				} );
				expect( spy ).not.toHaveBeenCalledWith(
					expect.objectContaining( { type: 'DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_SAVE_SUCCESS' } )
				);
				const refreshThunks = spy.mock.calls.filter(
					( [ action ] ) => typeof action === 'function'
				);
				expect( refreshThunks ).toHaveLength( 2 );
			} );
		} );

		describe( 'when the domain fails validation', () => {
			useMockPrimaryDomainError( 'domain_not_active', 'This domain is not active.' );

			test( 'rejects with the API message without re-fetching', async () => {
				await expect( setPrimaryDomain( siteId, 'example.com' )( spy ) ).rejects.toThrow(
					'This domain is not active.'
				);
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( { type: 'DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_SAVE_FAILURE' } )
				);
				expect( spy.mock.calls.some( ( [ action ] ) => typeof action === 'function' ) ).toBe(
					false
				);
			} );
		} );
	} );
} );
