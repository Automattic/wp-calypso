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
import {
	WHOIS_FETCH,
	WHOIS_FETCH_COMPLETED,
	WHOIS_FETCH_FAILED,
	WHOIS_UPDATE_COMPLETED,
} from 'lib/upgrades/action-types';
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
			type: WHOIS_FETCH,
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
			type: WHOIS_FETCH_FAILED,
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
			type: WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			data,
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
			type: WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );
		Dispatcher.handleServerAction( {
			type: WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data: anotherData,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( anotherData );
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
			type: WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );
		Dispatcher.handleServerAction( {
			type: WHOIS_FETCH_COMPLETED,
			domainName: ANOTHER_DOMAIN_NAME,
			data: anotherData,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.equal( data );
		expect( WhoisStore.getByDomainName( ANOTHER_DOMAIN_NAME ).data ).to.equal( anotherData );
	} );

	test( 'should return enabled needsUpdate flag and assign data when domain WHOIS update completed', () => {
		const registrantContactDetails = {
			org: 'My Willie Company, LLC',
			Willie: 'Nelson',
			type: whoisType.REGISTRANT,
		};
		Dispatcher.handleServerAction( {
			type: WHOIS_UPDATE_COMPLETED,
			domainName: DOMAIN_NAME,
			registrantContactDetails,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).needsUpdate ).to.be.true;
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.eql( [
			{
				org: 'My Willie Company, LLC',
				Willie: 'Nelson',
				type: whoisType.REGISTRANT,
			},
		] );
	} );

	test( 'should return enabled needsUpdate flag and merge data when domain WHOIS update completed', () => {
		const data = [
			{
				org: 'My First Company, LLC',
				type: whoisType.REGISTRANT,
			},
			{
				org: 'My Second Company, LLC',
				type: whoisType.PRIVACY_SERVICE,
			},
		];

		const registrantContactDetails = {
			Roy: 'Orbison',
			type: whoisType.REGISTRANT,
		};

		Dispatcher.handleServerAction( {
			type: WHOIS_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			data,
		} );

		Dispatcher.handleServerAction( {
			type: WHOIS_UPDATE_COMPLETED,
			domainName: DOMAIN_NAME,
			registrantContactDetails,
		} );

		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).needsUpdate ).to.be.true;
		expect( WhoisStore.getByDomainName( DOMAIN_NAME ).data ).to.be.eql( [
			{
				org: 'My First Company, LLC',
				Roy: 'Orbison',
				type: whoisType.REGISTRANT,
			},
			{
				org: 'My Second Company, LLC',
				type: whoisType.PRIVACY_SERVICE,
			},
		] );
	} );
} );
