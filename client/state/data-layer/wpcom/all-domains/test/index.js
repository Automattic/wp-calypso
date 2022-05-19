import {
	ALL_DOMAINS_REQUEST,
	ALL_DOMAINS_REQUEST_SUCCESS,
	ALL_DOMAINS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { getAllDomains, getAllDomainsError, getAllDomainsSuccess } from '../';

const isErrorNotice = ( action ) => {
	return action && action.notice && 'is-error' === action.notice.status;
};

describe( 'wpcom-api', () => {
	describe( 'all domains request', () => {
		const action = { type: ALL_DOMAINS_REQUEST };

		describe( '#getAllDomains', () => {
			test( 'should dispatch an HTTP request to the all-domains endpoint', () => {
				expect( getAllDomains( action ) ).toEqual(
					http(
						{
							method: 'GET',
							path: '/all-domains',
						},
						action
					)
				);
			} );
		} );

		describe( '#getAllDomainsFailure', () => {
			const message = 'An error has occurred';

			test( 'should dispatch a get all-domains failure action on error', () => {
				const resultActions = getAllDomainsError( action, { message } );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: ALL_DOMAINS_REQUEST_FAILURE,
					error: { message },
				} );
			} );
		} );

		describe( '#getAllDomainsSuccess', () => {
			test( 'should dispatch a get all-domains success action and response', () => {
				const domains = [
					{
						domain: 'test.blog',
					},
				];
				expect( getAllDomainsSuccess( action, { domains } ) ).toEqual( {
					type: ALL_DOMAINS_REQUEST_SUCCESS,
					domains,
				} );
			} );

			test( 'should dispatch a get all-domains failure action on no response', () => {
				const resultActions = getAllDomainsSuccess( action, undefined );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: ALL_DOMAINS_REQUEST_FAILURE,
					error: 'Failed to retrieve your domains. No response was received',
				} );
			} );
		} );
	} );
} );
