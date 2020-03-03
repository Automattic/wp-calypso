/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import moment from 'moment';

const MILLIS_IN_MINUTE = 60 * 1000;

export default function humanDate(
	dateOrMoment,
	dateFormat = 'll',
	locale = i18n.getLocaleSlug()
) {
	const now = moment().locale( locale );
	dateOrMoment = moment( dateOrMoment ).locale( locale );

	let millisAgo = now.diff( dateOrMoment );
	if ( millisAgo < 0 ) {
		millisAgo = 0;
	}

	if ( millisAgo < MILLIS_IN_MINUTE ) {
		return i18n.translate( 'just now' );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 ) {
		const minutes = Math.ceil( millisAgo / MILLIS_IN_MINUTE );
		return i18n.translate( '%(minutes)dm ago', {
			args: {
				minutes: minutes,
			},
			comment: 'example for a resulting string: 2m ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 ) {
		const hours = now.diff( dateOrMoment, 'hours' );
		return i18n.translate( '%(hours)dh ago', {
			args: {
				hours: hours,
			},
			comment: 'example for a resulting string: 5h ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 * 7 ) {
		const days = now.diff( dateOrMoment, 'days' );
		return i18n.translate( '%(days)dd ago', {
			args: {
				days: days,
			},
			comment: 'example for a resulting string: 4d ago',
		} );
	}

	return dateOrMoment.format( dateFormat );
}
