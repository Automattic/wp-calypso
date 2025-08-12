import { useTranslate } from 'i18n-calypso';
import { useState, useMemo, useEffect } from 'react';

interface TimeSinceProps {
	/**
	 * An ISO 8601 date string or any string parseable by `new Date()`.
	 */
	date: string;
	/**
	 * Controls the formatting for older dates:
	 * - 'll'   : Locale medium date (default, e.g., "Jun 12, 2024" or "12 Jun 2024" depending on locale)
	 * - 'lll'  : Always "d MMM y" (e.g., "12 Jun 2024"), locale-independent
	 * - 'llll' : Full date and time (e.g., "Wednesday, June 12, 2024 at 2:00:00 PM")
	 */
	dateFormat?: string;
	/**
	 * CSS class for the <time> element.
	 */
	className?: string;
	/**
	 * BCP 47 locale string (e.g., "en", "es-ES"). Defaults to the user's locale.
	 */
	locale?: string;
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
		return formatDate( dateObj, dateFormat, translate.localeSlug );
	}, [ now, date, dateFormat, translate ] );
}

/**
 * Format a date using Intl.DateTimeFormat
 */
function formatDate( date: Date, format: string, locale?: string ): string {
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

/**
 * TimeSince component
 *
 * Displays a human-readable representation of the time elapsed since a given date.
 * - For recent dates, shows relative time (e.g., "just now", "5m ago", "2d ago").
 * - For older dates, shows a formatted date string.
 *
 * The full formatted date is also available as a tooltip (title attribute).
 * @example
 *   <TimeSince date={someISOString} />
 *   <TimeSince date={someISOString} dateFormat="lll" />
 */
function TimeSince( { className, date, dateFormat = 'll' }: TimeSinceProps ) {
	const translate = useTranslate();
	const humanDate = useRelativeTime( date, dateFormat );
	const fullDate = formatDate( new Date( date ), 'llll', translate.localeSlug );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
