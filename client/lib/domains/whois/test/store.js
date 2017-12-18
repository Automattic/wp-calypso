/** @format */

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
import { whoisType } from '../constants';

describe( 'store', () => {
	const DOMAIN_NAME = 'domain.name';

	test( 'should be an object', () => {
		expect( WhoisStore ).to.be.an( 'object' );
	} );

	test( 'should have initial state equal an empty object', () => {
		expect( WhoisStore.get() ).to.be.eql( {} );
	} );

	test( 'should return initial domain state for the domain that has no data', () => {
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: false,
			needsUpdate: true,
		} );
	} );

	test( 'should return an object with disabled needsUpdate and enabled isFetching flag when fetching domain data triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.WHOIS_FETCH,
			domainName: DOMAIN_NAME,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: true,
			needsUpdate: false,
		} );
	} );

	test( 'should return an object with enabled needsUpdate and disabled isFetching flag when fetching domain data failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.WHOIS_FETCH_FAILED,
			domainName: DOMAIN_NAME,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data: null,
			hasLoadedFromServer: false,
			isFetching: false,
			needsUpdate: true,
		} );
	} );

	test( 'should return contact data when fetching domain data completed', () => {
		const data = [
			{
				org: 'My Company, LLC',
				type: whoisType.REGISTRANT,
			},
		];

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data,
			registrantContactDetails: data[ 0 ],
			hasLoadedFromServer: true,
			isFetching: false,
			needsUpdate: false,
		} );
	} );

	test( 'should return latest whois data when domain data received twice', () => {
		const data = [
			{
				org: 'My First Company, LLC',
				type: whoisType.REGISTRANT,
			},
		];
		const anotherData = [
			{
				org: 'My Second Company, LLC',
				type: whoisType.REGISTRANT,
			},
		];

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data: anotherData,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( anotherData );
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).registrantContactDetails ).to.be.equal(
			anotherData[ 0 ]
		);
	} );

	test( 'should contain whois data for given domain equal to received from server action', () => {
		const ANOTHER_DOMAIN_NAME = 'another-domain.name';
		const data = [
			{
				org: 'My First Company, LLC',
				type: whoisType.REGISTRANT,
			},
		];
		const anotherData = [
			{
				org: 'My Second Company, LLC',
				type: whoisType.REGISTRANT,
			},
		];

		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_FETCH_COMPLETED,
			domainName: ANOTHER_DOMAIN_NAME,
			data: anotherData,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( data );
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).registrantContactDetails ).to.be.equal(
			data[ 0 ]
		);
		expect( WhoisStore.getByDomainName( ANOTHER_DOMAIN_NAME ).data ).to.equal( anotherData );
		expect( WhoisStore.getByDomainName( ANOTHER_DOMAIN_NAME ).registrantContactDetails ).to.equal(
			anotherData[ 0 ]
		);
	} );

	test( 'should return enabled needsUpdate flag and new registrantContactDetails when domain WHOIS update completed', () => {
		const registrantContactDetails = {
			Willie: 'Nelson',
		};
		Dispatcher.handleServerAction( {
			type: ActionTypes.WHOIS_UPDATE_COMPLETED,
			domainName: DOMAIN_NAME,
			registrantContactDetails,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).needsUpdate ).to.be.true;
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).registrantContactDetails ).to.be.eql(
			registrantContactDetails
		);
	} );
} );
