/**
 * External dependencies
 */
const assign = require( 'lodash/assign' ),
	expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
const domainsAssembler = require( './../assembler' ),
	domainTypes = require( './../constants' ).type;

describe( 'assembler', () => {
	const DOMAIN_NAME = 'Name',
		redirectDataTransferObject = {
			domain: DOMAIN_NAME,
			has_registration: false,
			primary_domain: false,
			type: 'redirect',
			wpcom_domain: false
		},
		mappedDataTransferObject = assign( {}, redirectDataTransferObject, {
			type: 'mapped'
		} ),
		primaryRegisteredDataTransferObject = assign( {}, redirectDataTransferObject, {
			has_registration: true,
			primary_domain: true,
			type: 'wpcom'
		} ),
		wpcomDataTransferObject = assign( {}, redirectDataTransferObject, {
			type: 'wpcom',
			wpcom_domain: true
		} ),
		redirectDomainObject = {
			autoRenewalDate: undefined,
			expirationMoment: null,
			expired: undefined,
			expirySoon: undefined,
			googleAppsSubscription: undefined,
			hasPrivacyProtection: undefined,
			isAutoRenewing: undefined,
			currentUserCanManage: undefined,
			isWhoisEditable: undefined,
			isPendingIcannVerification: undefined,
			isPrimary: false,
			name: DOMAIN_NAME,
			manualTransferRequired: undefined,
			privateDomain: undefined,
			registrationDate: undefined,
			registrationMoment: undefined,
			type: domainTypes.SITE_REDIRECT
		},
		mappedDomainObject = assign( {}, redirectDomainObject, {
			type: domainTypes.MAPPED
		} ),
		primaryRegisteredDomainObject = assign( {}, redirectDomainObject, {
			isPrimary: true,
			type: domainTypes.REGISTERED
		} ),
		wpcomDomainObject = assign( {}, redirectDomainObject, {
			type: domainTypes.WPCOM
		} );

	it( 'should produce empty array when null data transfer object passed', () => {
		expect( domainsAssembler.createDomainObjects( null ) ).to.be.eql( [] );
	} );

	it( 'should produce array with domains even when there is no primary domain', () => {
		expect( domainsAssembler.createDomainObjects( [ redirectDataTransferObject ] ) ).to.be.eql( [ redirectDomainObject ] );
	} );

	it( 'should produce array with registered domain first when registered domain is set as primary domain', () => {
		expect( domainsAssembler.createDomainObjects( [
			mappedDataTransferObject,
			primaryRegisteredDataTransferObject,
			redirectDataTransferObject,
			wpcomDataTransferObject
		] ) ).to.be.eql( [
			primaryRegisteredDomainObject,
			mappedDomainObject,
			redirectDomainObject,
			wpcomDomainObject
		] );
	} );
} );
