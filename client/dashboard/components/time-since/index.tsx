import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../app/auth';

function useRelativeTime( date: Date, dateFormat = 'll', locale: string ) {
	const [ now, setNow ] = useState( () => new Date() );

	useEffect( () => {
		const intervalId = setInterval( () => setNow( new Date() ), 10000 );
		return () => clearInterval( intervalId );
	}, [] );

	return useMemo( () => {
		const millisAgo = now.getTime() - date.getTime();

		// Handle invalid or future dates
		if ( isNaN( date.getTime() ) || millisAgo < 0 ) {
			return formatDate( date, dateFormat, locale );
		}

		const secondsAgo = Math.floor( millisAgo / 1000 );
		const minutesAgo = Math.floor( secondsAgo / 60 );
		const hoursAgo = Math.floor( minutesAgo / 60 );
		const daysAgo = Math.floor( hoursAgo / 24 );

		// Just now
		if ( secondsAgo < 60 ) {
			return __( 'just now' );
		}

		// Minutes ago (less than 60 minutes)
		if ( minutesAgo < 60 ) {
			return sprintf(
				/* translators: %s is the number of minutes. Example for a resulting string: 2m ago */
				__( '%(minutes)dm ago' ),
				{
					minutes: minutesAgo,
				}
			);
		}

		// Hours ago (less than 24 hours)
		if ( hoursAgo < 24 ) {
			return sprintf(
				/* translators: %s is the number of hours. Example for a resulting string: 5h ago */
				__( '%(hours)dh ago' ),
				{
					hours: hoursAgo,
				}
			);
		}

		// Days ago (less than 7 days)
		if ( daysAgo < 7 ) {
			return sprintf(
				/* translators: %s is the number of days. Example for a resulting string: 4d ago */
				__( '%(days)dd ago' ),
				{
					days: daysAgo,
				}
			);
		}

		// For older dates, use the date format
		return formatDate( date, dateFormat, locale );
	}, [ now, date, dateFormat, locale ] );
}

function normalizeTimestamp( timestamp: string, isUtc?: boolean ) {
	if ( isUtc ) {
		// The timestamp is in UTC, in the 'YYYY-MM-DD HH:MM:SS' format.
		// Convert it to ISO 8601 format, which is required for the Date constructor
		// to parse the timestamp correctly.
		return timestamp.replace( ' ', 'T' ).concat( 'Z' );
	}
	return timestamp;
}

function formatDate( date: Date, format: string, locale: string ) {
	if ( ! date || isNaN( date.getTime() ) ) {
		return '';
	}

	const formatOptions: Intl.DateTimeFormatOptions = {
		dateStyle: 'medium',
		timeStyle: 'short',
	};

	if ( format === 'll' ) {
		formatOptions.dateStyle = 'medium';
		delete formatOptions.timeStyle;
	} else if ( format === 'lll' ) {
		formatOptions.dateStyle = undefined;
		formatOptions.timeStyle = undefined;
		formatOptions.day = 'numeric';
		formatOptions.month = 'short';
		formatOptions.year = 'numeric';
	} else if ( format === 'llll' ) {
		formatOptions.dateStyle = 'full';
		formatOptions.timeStyle = 'medium';
	}

	return new Intl.DateTimeFormat( locale, formatOptions ).format( date );
}

export function useTimeSince(
	timestamp: string,
	{ format, isUtc }: { format?: string; isUtc?: boolean } = { format: 'll', isUtc: false }
) {
	const { user } = useAuth();
	const locale = user.locale_variant || user.language || 'en';

	const date = new Date( normalizeTimestamp( timestamp, isUtc ) );
	return useRelativeTime( date, format, locale );
}

export default function TimeSince( {
	timestamp,
	format = 'll',
	isUtc = false,
}: {
	timestamp: string;
	format?: string;
	isUtc?: boolean;
} ) {
	const { user } = useAuth();
	const locale = user.locale_variant || user.language || 'en';

	const normalizedTimestamp = normalizeTimestamp( timestamp, isUtc );
	const date = new Date( normalizedTimestamp );

	const fullDate = formatDate( date, 'llll', locale );
	const relativeDate = useRelativeTime( date, format, locale );

	return (
		<time dateTime={ normalizedTimestamp } title={ fullDate }>
			{ relativeDate }
		</time>
	);
}
