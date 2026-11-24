import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import type { useTranslate } from 'i18n-calypso';

// Past this, minutes are harder to read than hours.
const MAX_WAIT_IN_MINUTES = 90;

export function isThrottledError( errorSlug: string ) {
	return 'throttled' === errorSlug;
}

function getContactSupportLink() {
	return (
		<a
			href={ localizeUrl( 'https://wordpress.com/support/contact/' ) }
			target="_blank"
			rel="noopener noreferrer"
		></a>
	);
}

export function getThrottledErrorMessage(
	translate: ( key: string, options?: Record< string, unknown > ) => string
): string {
	return translate(
		'Too many attempts. Please try again later. If you think this is in error, {{a}}contact support{{/a}}.',
		{
			components: {
				a: getContactSupportLink(),
			},
		}
	);
}

/**
 * The throttled message for a wait the server named. Rounds up, so the wait shown never ends
 * before the real one.
 */
export function getSignupLimitMessage(
	translate: ReturnType< typeof useTranslate >,
	secondsRemaining: number
) {
	const minutes = Math.ceil( secondsRemaining / 60 );
	const components = { a: getContactSupportLink() };

	if ( minutes > MAX_WAIT_IN_MINUTES ) {
		const hours = Math.ceil( minutes / 60 );
		return translate(
			'Too many attempts. Please try again in %(hours)s hour. If you think this is in error, {{a}}contact support{{/a}}.',
			'Too many attempts. Please try again in %(hours)s hours. If you think this is in error, {{a}}contact support{{/a}}.',
			{ count: hours, args: { hours: formatNumber( hours ) }, components }
		);
	}

	return translate(
		'Too many attempts. Please try again in %(minutes)s minute. If you think this is in error, {{a}}contact support{{/a}}.',
		'Too many attempts. Please try again in %(minutes)s minutes. If you think this is in error, {{a}}contact support{{/a}}.',
		{ count: minutes, args: { minutes: formatNumber( minutes ) }, components }
	);
}
