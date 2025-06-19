import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../app/auth';

function useRelativeTime( date: string, dateFormat = 'll', locale: string ) {
	const [ now, setNow ] = useState( () => new Date() );

	useEffect( () => {
		const intervalId = setInterval( () => setNow( new Date() ), 10000 );
		return () => clearInterval( intervalId );
	}, [] );

	return useMemo( () => {
		const dateObj = new Date( date );
		const millisAgo = now.getTime() - dateObj.getTime();

		// Handle invalid or future dates
		if ( isNaN( dateObj.getTime() ) || millisAgo < 0 ) {
			return formatDate( dateObj, dateFormat, locale );
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
		return formatDate( dateObj, dateFormat, locale );
	}, [ now, date, dateFormat, locale ] );
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

export default function TimeSince( { date, format = 'll' }: { date: string; format?: string } ) {
	const { user } = useAuth();
	const locale = user.locale_variant || user.language || 'en';

	const fullDate = formatDate( new Date( date ), 'llll', locale );
	const relativeDate = useRelativeTime( date, format, locale );

	return (
		<time dateTime={ date } title={ fullDate }>
			{ relativeDate }
		</time>
	);
}
