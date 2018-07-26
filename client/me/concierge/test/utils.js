/** @format */

/**
 * Internal dependencies
 */
import { cancelLink, rescheduleLink } from '../utils';

test( 'Generates cancel link', () => {
	const testSite = { slug: 'my-cool-site' };
	const testAppointment = { id: 4321 };

	expect( cancelLink( testSite, testAppointment ) ).toBe(
		'/me/concierge/my-cool-site/4321/cancel'
	);
} );

test( 'Generates reschedule link', () => {
	const testSite = { slug: 'my-cool-site' };
	const testAppointment = { id: 4321 };

	expect( rescheduleLink( testSite, testAppointment ) ).toBe(
		'/me/concierge/my-cool-site/4321/reschedule'
	);
} );
