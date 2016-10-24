/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import Dispatcher from 'dispatcher';
import { DOMAIN_NAME, EMAIL, EMAIL_FORWARDS, FORWARD_ADDRESS, MAILBOX_NAME } from './data';
import EmailForwardingStore from './../store';

describe( 'store', () => {
	it( 'should be an object', () => {
		expect( EmailForwardingStore ).to.be.an( 'object' );
	} );

	it( 'should have initial state equal an empty object', () => {
		expect( EmailForwardingStore.get() ).to.be.eql( {} );
	} );

	it( 'should return initial domain state for the domain that has no data', () => {
		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: false,
			isFetching: false,
			list: null,
			needsUpdate: true
		} );
	} );

	it( 'should return an object with disabled needsUpdate and enabled isFetching flag when fetching domain data triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.EMAIL_FORWARDING_FETCH,
			domainName: DOMAIN_NAME
		} );

		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: false,
			isFetching: true,
			list: null,
			needsUpdate: false
		} );
	} );

	it( 'should return an object with enabled needsUpdate and disabled isFetching flag when fetching domain data failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.EMAIL_FORWARDING_FETCH_FAILED,
			domainName: DOMAIN_NAME
		} );

		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: false,
			isFetching: false,
			list: null,
			needsUpdate: true
		} );
	} );

	it( 'should return a list with email forwards when fetching domain data completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.EMAIL_FORWARDING_FETCH_COMPLETED,
			domainName: DOMAIN_NAME,
			forwards: EMAIL_FORWARDS
		} );

		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: true,
			isFetching: false,
			list: EMAIL_FORWARDS,
			needsUpdate: false
		} );
	} );

	it( 'should return an empty email forwards list when deleting mailbox completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.EMAIL_FORWARDING_DELETE_COMPLETED,
			domainName: DOMAIN_NAME,
			mailbox: MAILBOX_NAME
		} );

		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: true,
			isFetching: false,
			list: [],
			needsUpdate: true
		} );
	} );

	it( 'should return an email forwards list with temporary mailbox when adding mailbox completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.EMAIL_FORWARDING_ADD_COMPLETED,
			domainName: DOMAIN_NAME,
			mailbox: MAILBOX_NAME,
			destination: FORWARD_ADDRESS
		} );

		expect( EmailForwardingStore.getByDomainName( DOMAIN_NAME ) ).to.be.eql( {
			hasLoadedFromServer: true,
			isFetching: false,
			list: [ {
				active: true,
				domain: DOMAIN_NAME,
				email: EMAIL,
				forward_address: FORWARD_ADDRESS,
				mailbox: MAILBOX_NAME,
				temporary: true
			} ],
			needsUpdate: true
		} );
	} );
} );
