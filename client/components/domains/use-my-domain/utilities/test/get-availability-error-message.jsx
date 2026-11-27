/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityErrorMessage } from '../get-availability-error-message';

describe( 'getAvailabilityErrorMessage()', () => {
	test( 'lets a mappable domain through to the Transfer or Connect options', () => {
		expect(
			getAvailabilityErrorMessage( {
				availabilityData: {
					status: domainAvailability.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
					mappable: domainAvailability.MAPPABLE,
				},
				domainName: 'example.com',
			} )
		).toBeNull();
	} );

	test.each( [ domainAvailability.MAPPABLE, domainAvailability.UNKNOWN ] )(
		'stops a domain the registry is deleting when mappable is %s',
		( mappable ) => {
			const message = getAvailabilityErrorMessage( {
				availabilityData: {
					status: domainAvailability.PENDING_DELETE_NOT_TRANSFERRABLE,
					mappable,
				},
				domainName: 'example.com',
			} );

			expect( render( <div>{ message }</div> ).container ).toHaveTextContent(
				"example.com is being deleted by its registry, so it can't be transferred or connected. It can be registered again once the registry releases it."
			);
		}
	);
} );
