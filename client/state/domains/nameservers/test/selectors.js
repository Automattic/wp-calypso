/**
 * Internal dependencies
 */
import { initialDomainState } from '../reducer';
import { getByDomainName } from '../selectors';

describe( 'selectors', () => {
	describe( 'getByDomainName', () => {
		const DOMAIN_NAME = 'dummy.com';

		test( 'should return default domain state when state is empty', () => {
			expect( getByDomainName( {}, DOMAIN_NAME ) ).toEqual( initialDomainState );
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
			expect( getByDomainName( state, DOMAIN_NAME ) ).toEqual( initialDomainState );
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
			expect( getByDomainName( state, DOMAIN_NAME ) ).toEqual( domainState );
		} );
	} );
} );
