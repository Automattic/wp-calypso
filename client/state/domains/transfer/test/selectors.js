/**
 * Internal dependencies
 */
import initialDomainState from '../initial';
import { getDomainWapiInfoByDomainName } from '../selectors';

describe( 'selectors', () => {
	describe( 'getDomainWapiInfoByDomainName', () => {
		const DOMAIN_NAME = 'dummy.com';

		test( 'should return default domain state when state is empty', () => {
			expect( getDomainWapiInfoByDomainName( {}, DOMAIN_NAME ) ).toEqual( initialDomainState );
		} );

		test( 'should return default domain state when fetching state for domain that has no data', () => {
			const state = {
				domains: {
					transfer: {
						items: {
							'wordpress.com': {
								...initialDomainState,
								isRequestingTransferCode: true,
							},
						},
					},
				},
			};
			expect( getDomainWapiInfoByDomainName( state, DOMAIN_NAME ) ).toEqual( initialDomainState );
		} );

		test( 'should return domain data when domain data is known', () => {
			const domainState = {
				...initialDomainState,
				isRequestingTransferCode: true,
			};
			const state = {
				domains: {
					transfer: {
						items: {
							[ DOMAIN_NAME ]: domainState,
						},
					},
				},
			};
			expect( getDomainWapiInfoByDomainName( state, DOMAIN_NAME ) ).toEqual( domainState );
		} );
	} );
} );
