/** @format */

export const cancelLink = ( site, appointment ) =>
	`/me/concierge/${ site.slug }/${ appointment.id }/cancel`;

export const rescheduleLink = ( site, appointment ) =>
	`/me/concierge/${ site.slug }/${ appointment.id }/reschedule`;
