/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import Dispatcher from 'dispatcher';
import NameserversStore from './../store';

describe( 'store', () => {
	const DOMAIN_NAME = 'dummy.com',
		NAMSERVERS = [
			'ns1.dummy.com',
			'ns2.dummy.com',
			'ns3.dummy.com'
		];

	it( 'should be an object', () => {
		expect( NameserversStore ).to.be.an( 'object' );
	} );

	it( 'should have initial state equal an empty object', () => {
		expect( NameserversStore.get() ).to.be.eql( {} );
	} );

	it( 'should return default domain state when fetching state for domain that has no data', () => {
		expect( NameserversStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			isFetching: false,
			hasLoadedFromServer: false,
			list: null
		} );
	} );

	it( 'should return an object with enabled isFetching flag when fetching domain data triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.NAMESERVERS_FETCH,
			domainName: DOMAIN_NAME
		} );

		expect( NameserversStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			isFetching: true,
			hasLoadedFromServer: false,
			list: null
		} );
	} );

	it( 'should return an object with disabled isFetching flag when fetching domain data failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.NAMESERVERS_FETCH_FAILED,
			domainName: DOMAIN_NAME
		} );

		expect( NameserversStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			isFetching: false,
			hasLoadedFromServer: false,
			list: null
		} );
	} );

	it( 'should return a list with name servers when fetching domain data completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.NAMESERVERS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			nameservers: NAMSERVERS
		} );

		expect( NameserversStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			isFetching: false,
			hasLoadedFromServer: true,
			list: NAMSERVERS
		} );
	} );

	it( 'should return an updated list with name servers when name servers update completed', () => {
		const UPDATED_NAMESERVERS = [
			'ns1.foo.com',
			'ns2.foo.com'
		];

		Dispatcher.handleViewAction( {
			type: ActionTypes.NAMESERVERS_UPDATE_COMPLETED,
			domainName: DOMAIN_NAME,
			nameservers: UPDATED_NAMESERVERS
		} );

		expect( NameserversStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			isFetching: false,
			hasLoadedFromServer: true,
			list: UPDATED_NAMESERVERS
		} );
	} );
} );
