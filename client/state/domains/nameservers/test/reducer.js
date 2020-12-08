/**
 * Internal dependencies
 */
import { fetchNameservers, fetchNameserversFailure, receiveNameservers } from '../actions';
import initialDomainState from '../initial';
import reducer from '../reducer';

describe( 'reducer', () => {
	const domainName = 'dummy.com';
	const nameServers = [ 'ns1.dummy.com', 'ns2.dummy.com', 'ns3.dummy.com' ];

	test( 'should return an object with enabled isFetching flag when fetching domain data triggered', () => {
		const state = reducer( {}, fetchNameservers( domainName ) );

		expect( state ).toEqual( {
			[ domainName ]: {
				...initialDomainState,
				isFetching: true,
			},
		} );
	} );

	test( 'should return an object with disabled isFetching flag when fetching domain data failed', () => {
		const initialState = {
			[ domainName ]: {
				...initialDomainState,
				isFetching: true,
			},
		};

		const state = reducer( initialState, fetchNameserversFailure( domainName ) );

		expect( state ).toEqual( {
			[ domainName ]: {
				...initialDomainState,
				isFetching: false,
				error: true,
			},
		} );
	} );

	test( 'should return a list with name servers when receiving nameservers completed', () => {
		const initialState = {
			[ domainName ]: {
				...initialDomainState,
				isFetching: true,
			},
		};

		const state = reducer( initialState, receiveNameservers( domainName, nameServers ) );

		expect( state ).toEqual( {
			[ domainName ]: {
				isFetching: false,
				hasLoadedFromServer: true,
				error: false,
				list: nameServers,
			},
		} );
	} );
} );
