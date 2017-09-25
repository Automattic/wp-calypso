/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import WhoisStore from './../store';
import Dispatcher from 'dispatcher';
import { action as ActionTypes } from 'lib/upgrades/constants';

describe( 'store', () => {
	const DOMAIN_NAME = 'domain.name';

	it( 'should be an object', () => {
		expect( WhoisStore ).to.be.an( 'object' );
	} );

	it( 'should have initial state equal an empty object', () => {
		expect( WhoisStore.get() ).to.be.eql( {} );
	} );

	it( 'should return initial domain state for the domain that has no data', () => {
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: false,
			needsUpdate: true
		} );
	} );

	it( 'should return an object with disabled needsUpdate and enabled isFetching flag when fetching domain data triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.WHOIS_FETCH,
			domainName: DOMAIN_NAME
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: true,
			needsUpdate: false
		} );
	} );

	it( 'should return an object with enabled needsUpdate and disabled isFetching flag when fetching domain data failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.WHOIS_FETCH_FAILED,
			domainName: DOMAIN_NAME
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: false,
			needsUpdate: true
		} );
	} );

	it( 'should return contact data when fetching domain data completed', () => {
		const data = {
			org: 'My Company, LLC'
		};

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data,
			hasLoadedFromServer: true,
			isFetching: false,
			needsUpdate: false
		} );
	} );

	it( 'should return latest whois data when domain data received twice', () => {
		const data = {
				org: 'My First Company, LLC'
			},
			anotherData = {
				org: 'My Second Company, LLC'
			};

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data
		} );
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data: anotherData
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( anotherData );
	} );

	it( 'should contain whois data for given domain equal to received from server action', () => {
		const ANOTHER_DOMAIN_NAME = 'another-domain.name',
			data = {
				org: 'My First Company, LLC'
			},
			anotherData = {
				org: 'My Second Company, LLC'
			};

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data
		} );
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: ANOTHER_DOMAIN_NAME,
			data: anotherData
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( data );
		expect( WhoisStore.getByDomainName( ANOTHER_DOMAIN_NAME ).data ).to.equal( anotherData );
	} );

	it( 'should return enabled needsUpdate flag when domain WHOIS update completed', () => {
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_UPDATE_COMPLETED,
			domainName: DOMAIN_NAME
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).needsUpdate ).to.be.true;
	} );
} );
