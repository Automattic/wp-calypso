import { DomainAvailabilityStatus } from '@automattic/api-core';
import { isConnectableDomain } from '../';

describe( 'isConnectableDomain', () => {
	test.each( [
		[
			'true for a mappable domain',
			DomainAvailabilityStatus.TRANSFERRABLE,
			DomainAvailabilityStatus.MAPPABLE,
			true,
		],
		[
			'false for a domain that is not mappable',
			DomainAvailabilityStatus.TRANSFERRABLE,
			DomainAvailabilityStatus.MAPPED,
			false,
		],
		[
			'false for a mappable domain the registry is deleting',
			DomainAvailabilityStatus.PENDING_DELETE_NOT_TRANSFERRABLE,
			DomainAvailabilityStatus.MAPPABLE,
			false,
		],
	] )( 'is %s', ( _label, status, mappable, expected ) => {
		expect( isConnectableDomain( { status, mappable } ) ).toBe( expected );
	} );
} );
