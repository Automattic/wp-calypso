import { render } from '@testing-library/react';
import { UNAVAILABLE_FOR_PURCHASE_STATUSES } from '../../page/constants';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { getAvailabilityNotice } from '../get-availability-notice';
import type { DomainSearchEvents } from '../../page/types';

const events = {} as DomainSearchEvents;

describe( 'getAvailabilityNotice', () => {
	// The suggestion CTA refuses to add these to the cart, so each one has to
	// explain itself — otherwise the click does nothing with no message.
	it.each( UNAVAILABLE_FOR_PURCHASE_STATUSES )(
		'returns a notice for %s, which blocks adding to the cart',
		( status ) => {
			const notice = getAvailabilityNotice(
				'example.blog',
				buildAvailability( { domain_name: 'example.blog', tld: 'blog', status } ),
				events
			);

			expect( notice ).not.toBeNull();

			const { container } = render( <>{ notice?.message }</> );

			expect( container.textContent?.trim() ).not.toHaveLength( 0 );
		}
	);
} );
