import { translationExists } from '@automattic/i18n-utils';
import { __, _n, sprintf } from '@wordpress/i18n';
import { getCalendarDaysUntil, getRelativeDayString } from './datetime';
import { EXPIRY_ERROR_DAYS, EXPIRY_WARNING_DAYS } from './purchase';

export interface ExpiryStatusCopy {
	intent: 'warning' | 'error';

	/**
	 * Null only where this locale has no translation for the wording yet, in
	 * which case the caller should render its own older sentence and keep the
	 * intent — the color is right either way. Once the copy below is translated
	 * this stops being nullable, and those fallbacks can go with it.
	 */
	text: string | null;
}

/**
 * How to describe a subscription that is heading for expiration, or null when it
 * is far enough out that there is nothing to say.
 *
 * Counts the days exactly rather than using `getRelativeDayString`, which
 * collapses to the largest unit and would render everything from 31 to 60 days
 * as "in 1 month" — the whole span this window added.
 */
export function getExpiringSoonCopy( expiryDate: Date ): ExpiryStatusCopy | null {
	const days = getCalendarDaysUntil( expiryDate );

	// Covers both "later today" and a date that has passed while the backend
	// still reports the subscription as expiring.
	if ( days <= 0 ) {
		return {
			intent: 'error',
			text: translationExists( 'Expires today' ) ? __( 'Expires today' ) : null,
		};
	}

	if ( days > EXPIRY_WARNING_DAYS ) {
		return null;
	}

	return {
		intent: days <= EXPIRY_ERROR_DAYS ? 'error' : 'warning',
		// The singular, because that is the key translations are stored under.
		text: translationExists( 'Expires in %(days)d day' )
			? sprintf(
					// translators: %(days)d is a number of days
					_n( 'Expires in %(days)d day', 'Expires in %(days)d days', days ),
					{ days }
			  )
			: null,
	};
}

/**
 * How to describe a subscription whose expiration date has passed. Always has
 * wording of its own, and is always an error: the subscription has lapsed.
 */
export function getExpiredCopy( expiryDate: Date ): ExpiryStatusCopy {
	const daysAgo = -getCalendarDaysUntil( expiryDate );

	if ( daysAgo <= 0 ) {
		return { intent: 'error', text: __( 'Expired today' ) };
	}

	// The singular, because that is the key translations are stored under.
	const hasDayCountTranslation = translationExists( 'Expired %(days)d day ago' );

	// Counting the days exactly only reads well for a while — "Expired 243 days
	// ago" does not — so anything older rounds to the largest unit. So does copy
	// this locale hasn't translated yet, which lands on the same sentence.
	if ( daysAgo > EXPIRY_WARNING_DAYS || ! hasDayCountTranslation ) {
		return {
			intent: 'error',
			text: sprintf(
				// translators: timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"
				__( 'Expired %(timeSinceExpiry)s' ),
				{ timeSinceExpiry: getRelativeDayString( expiryDate, 'past' ) }
			),
		};
	}

	return {
		intent: 'error',
		text: sprintf(
			// translators: %(days)d is a number of days
			_n( 'Expired %(days)d day ago', 'Expired %(days)d days ago', daysAgo ),
			{ days: daysAgo }
		),
	};
}

/**
 * Tooltip for a status that links to renewal checkout, for a subscription that
 * has not lapsed yet. The status counts days rather than naming the date, and
 * says nothing about where the link goes, so this supplies both. Null where the
 * wording has no translation yet.
 */
export function getExpiringSoonRenewalTitle( formattedExpiryDate: string ): string | null {
	return translationExists( 'Expires on %s (renew this purchase)' )
		? // translators: %s is a formatted date
		  sprintf( __( 'Expires on %s (renew this purchase)' ), formattedExpiryDate )
		: null;
}

/**
 * As {@link getExpiringSoonRenewalTitle}, for a subscription that has lapsed.
 */
export function getExpiredRenewalTitle( formattedExpiryDate: string ): string | null {
	return translationExists( 'Expired on %s (renew this purchase)' )
		? // translators: %s is a formatted date
		  sprintf( __( 'Expired on %s (renew this purchase)' ), formattedExpiryDate )
		: null;
}
