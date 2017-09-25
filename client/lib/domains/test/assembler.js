/**
 * External dependencies
 */
import { assign } from 'lodash';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import domainsAssembler from './../assembler';

import { type as domainTypes } from './../constants';

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
			autoRenewalMoment: undefined,
			currentUserCanManage: undefined,
			domainLockingAvailable: undefined,
			expirationMoment: undefined,
			expired: undefined,
			expirySoon: undefined,
			googleAppsSubscription: undefined,
			hasPrivacyProtection: undefined,
			isAutoRenewing: undefined,
			isPendingIcannVerification: undefined,
			isPendingWhoisUpdate: undefined,
			isPrimary: false,
			name: DOMAIN_NAME,
			manualTransferRequired: undefined,
			owner: undefined,
			privateDomain: undefined,
			privacyAvailable: undefined,
			pendingTransfer: undefined,
			registrar: undefined,
			registrationMoment: undefined,
			subscriptionId: undefined,
			type: domainTypes.SITE_REDIRECT,
			transferLockOnWhoisUpdateOptional: undefined,
			whoisUpdateUnmodifiableFields: undefined,
			hasZone: undefined,
			pointsToWpcom: undefined
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
