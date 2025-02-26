import { useTranslate } from 'i18n-calypso';
import { useState, useMemo, useEffect } from 'react';

interface TimeSinceProps {
	date: string;
	dateFormat?: string;
	className?: string;
}

/**
 * Formats a date using Intl.RelativeTimeFormat or Intl.DateTimeFormat
 */
function useRelativeTime( date: string, dateFormat = 'll' ) {
	const [ now, setNow ] = useState( () => new Date() );
	const translate = useTranslate();

	useEffect( () => {
		const intervalId = setInterval( () => setNow( new Date() ), 10000 );
		return () => clearInterval( intervalId );
	}, [] );

	return useMemo( () => {
		const dateObj = new Date( date );
		const millisAgo = now.getTime() - dateObj.getTime();

		// Handle invalid or future dates
		if ( isNaN( dateObj.getTime() ) || millisAgo < 0 ) {
			return formatDate( dateObj, dateFormat );
		}

		const secondsAgo = Math.floor( millisAgo / 1000 );
		const minutesAgo = Math.floor( secondsAgo / 60 );
		const hoursAgo = Math.floor( minutesAgo / 60 );
		const daysAgo = Math.floor( hoursAgo / 24 );

		// Just now
		if ( secondsAgo < 60 ) {
			return translate( 'just now' );
		}

		// Minutes ago (less than 60 minutes)
		if ( minutesAgo < 60 ) {
			return translate( '%(minutes)dm ago', {
				args: { minutes: minutesAgo },
				comment: 'example for a resulting string: 2m ago',
			} );
		}

		// Hours ago (less than 24 hours)
		if ( hoursAgo < 24 ) {
			return translate( '%(hours)dh ago', {
				args: { hours: hoursAgo },
				comment: 'example for a resulting string: 5h ago',
			} );
		}

		// Days ago (less than 7 days)
		if ( daysAgo < 7 ) {
			return translate( '%(days)dd ago', {
				args: { days: daysAgo },
				comment: 'example for a resulting string: 4d ago',
			} );
		}

		// For older dates, use the date format
		return formatDate( dateObj, dateFormat );
	}, [ now, date, dateFormat, translate ] );
}

/**
 * Format a date using Intl.DateTimeFormat
 */
function formatDate( date: Date, format: string ): string {
	// Map moment-style formats to Intl options
	const formatOptions: Intl.DateTimeFormatOptions = {
		// Default to medium date format
		dateStyle: 'medium',
		timeStyle: 'short',
	};

	// Handle common moment formats
	if ( format === 'll' ) {
		// Medium date format without time
		formatOptions.dateStyle = 'medium';
		delete formatOptions.timeStyle;
	} else if ( format === 'llll' ) {
		// Full date and time format
		formatOptions.dateStyle = 'full';
		formatOptions.timeStyle = 'medium';
	}

	return new Intl.DateTimeFormat( undefined, formatOptions ).format( date );
}

function TimeSince( { className, date, dateFormat = 'll' }: TimeSinceProps ) {
	const humanDate = useRelativeTime( date, dateFormat );
	const fullDate = formatDate( new Date( date ), 'llll' );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
