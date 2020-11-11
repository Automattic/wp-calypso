/**
 * Internal dependencies
 */
import initialDomainState from '../initial';
import { getNameserversByDomainName } from '../selectors';

describe( 'selectors', () => {
	describe( 'getNameserversByDomainName', () => {
		const DOMAIN_NAME = 'dummy.com';

		test( 'should return default domain state when state is empty', () => {
			expect( getNameserversByDomainName( {}, DOMAIN_NAME ) ).toEqual( initialDomainState );
		} );

		test( 'should return default domain state when fetching state for domain that has no data', () => {
			const state = {
				domains: {
					nameservers: {
						'wordpress.com': {
							...initialDomainState,
							isFetching: true,
						},
					},
				},
			};
			expect( getNameserversByDomainName( state, DOMAIN_NAME ) ).toEqual( initialDomainState );
		} );

		test( 'should return domain data when domain data is known', () => {
			const domainState = {
				...initialDomainState,
				isFetching: true,
			};
			const state = {
				domains: {
					nameservers: {
						[ DOMAIN_NAME ]: domainState,
					},
				},
			};
			expect( getNameserversByDomainName( state, DOMAIN_NAME ) ).toEqual( domainState );
		} );
	} );
} );
