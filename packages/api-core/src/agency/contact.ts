import { __ } from '@wordpress/i18n';
import { prependHTTPS } from '@wordpress/url';
import type { AgencyLeadMatchingProfile, AgencyLeadMatchingResponse } from './types';

export function preserveIgnoredAgencyContacts(
	profile: AgencyLeadMatchingProfile,
	previousProfile: AgencyLeadMatchingProfile | null | undefined,
	ignoredFields: AgencyLeadMatchingResponse[ 'ignored_contact_fields' ]
): AgencyLeadMatchingProfile {
	if ( ! ignoredFields?.length ) {
		return profile;
	}

	const contact = { ...profile.contact };
	for ( const field of ignoredFields ) {
		const savedValue = previousProfile?.contact?.[ field ];
		if ( savedValue !== undefined ) {
			contact[ field ] = savedValue;
		}
	}
	return { ...profile, contact };
}

export function normalizeAgencyBookingLink( value: string ): string {
	return prependHTTPS( value.trim() );
}

export function validateAgencyLeadMatchingContact(
	contact: AgencyLeadMatchingProfile[ 'contact' ]
): { phone?: string; bookingLink?: string } {
	const errors: { phone?: string; bookingLink?: string } = {};
	if ( contact?.phone && ! /^\+[1-9]\d{3,14}(?: ext \d+)?$/.test( contact.phone ) ) {
		errors.phone = __(
			'Enter a phone number with a country code and 4–15 digits, optionally followed by “ext” and an extension.'
		);
	}
	if ( contact?.booking_link ) {
		try {
			const url = new URL( contact.booking_link );
			if (
				! /^https?:\/\/[^/\s]/i.test( contact.booking_link ) ||
				! url.hostname ||
				/\s/.test( contact.booking_link )
			) {
				throw new Error( 'Invalid booking link' );
			}
		} catch {
			errors.bookingLink = __( 'Enter a valid HTTP or HTTPS booking link.' );
		}
	}
	return errors;
}
