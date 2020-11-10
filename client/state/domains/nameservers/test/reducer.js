/**
 * Internal dependencies
 */
import {
	fetchNameservers,
	fetchNameserversFailure,
	fetchNameserversSuccess,
	updateNameserversSuccess,
} from '../actions';
import reducer, { initialDomainState } from '../reducer';

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

	test( 'should return a list with name servers when fetching domain data completed', () => {
		const initialState = {
			[ domainName ]: {
				...initialDomainState,
				isFetching: true,
			},
		};

		const state = reducer( initialState, fetchNameserversSuccess( domainName, nameServers ) );

		expect( state ).toEqual( {
			[ domainName ]: {
				isFetching: false,
				hasLoadedFromServer: true,
				error: false,
				list: nameServers,
			},
		} );
	} );

	test( 'should return an updated list with name servers when name servers update completed', () => {
		const updatedNameServers = [ 'ns1.foo.com', 'ns2.foo.com' ];

		const initialState = {
			[ domainName ]: {
				isFetching: false,
				hasLoadedFromServer: true,
				error: false,
				list: nameServers,
			},
		};

		const state = reducer(
			initialState,
			updateNameserversSuccess( domainName, updatedNameServers )
		);

		expect( state ).toEqual( {
			[ domainName ]: {
				isFetching: false,
				hasLoadedFromServer: true,
				error: false,
				list: updatedNameServers,
			},
		} );
	} );
} );
