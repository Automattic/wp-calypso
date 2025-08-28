import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { formatDate } from '../../utils/datetime';

function useRelativeTime( date: Date, locale: string, formatOptions?: Intl.DateTimeFormatOptions ) {
	const [ now, setNow ] = useState( () => new Date() );

	useEffect( () => {
		const intervalId = setInterval( () => setNow( new Date() ), 10000 );
		return () => clearInterval( intervalId );
	}, [] );

	return useMemo( () => {
		const millisAgo = now.getTime() - date.getTime();

		// Handle invalid or future dates
		if ( isNaN( date.getTime() ) || millisAgo < 0 ) {
			return formatDate( date, locale, formatOptions );
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
		return formatDate( date, locale, formatOptions );
	}, [ now, date, locale, formatOptions ] );
}

export function useTimeSince( timestamp: string, formatOptions?: Intl.DateTimeFormatOptions ) {
	const locale = useLocale();

	const date = new Date( timestamp );
	return useRelativeTime( date, locale, formatOptions );
}

export default function TimeSince( {
	timestamp,
	dateStyle,
	timeStyle,
}: {
	timestamp: string;
	dateStyle?: 'full' | 'long' | 'medium' | 'short';
	timeStyle?: 'full' | 'long' | 'medium' | 'short';
} ) {
	const locale = useLocale();

	const date = new Date( timestamp );
	const formatOptions = dateStyle || timeStyle ? { dateStyle, timeStyle } : undefined;

	const fullDate = formatDate( date, locale, formatOptions );
	const relativeDate = useRelativeTime( date, locale, formatOptions );

	return (
		<time dateTime={ timestamp } title={ fullDate }>
			{ relativeDate }
		</time>
	);
}
