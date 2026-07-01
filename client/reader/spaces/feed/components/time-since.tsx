import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';

interface Props {
	date: string;
}

function formatDate( date: Date, locale?: string, options?: Intl.DateTimeFormatOptions ): string {
	if ( Number.isNaN( date.getTime() ) ) {
		return '';
	}
	return new Intl.DateTimeFormat( locale, options ).format( date );
}

function useRelativeTime( date: string ) {
	const [ now, setNow ] = useState( () => new Date() );
	const translate = useTranslate();
	const { localeSlug } = translate;

	useEffect( () => {
		const intervalId = setInterval( () => setNow( new Date() ), 10000 );
		return () => clearInterval( intervalId );
	}, [] );

	return useMemo( () => {
		const dateObj = new Date( date );
		const millisAgo = now.getTime() - dateObj.getTime();
		if ( Number.isNaN( dateObj.getTime() ) || millisAgo < 0 ) {
			return formatDate( dateObj, localeSlug, { dateStyle: 'medium' } );
		}

		const minutesAgo = Math.floor( millisAgo / 60000 );
		const hoursAgo = Math.floor( minutesAgo / 60 );
		const daysAgo = Math.floor( hoursAgo / 24 );

		if ( minutesAgo < 1 ) {
			return translate( 'just now' );
		}
		if ( minutesAgo < 60 ) {
			return translate( '%(minutes)dm ago', {
				args: { minutes: minutesAgo },
				comment: 'example for a resulting string: 2m ago',
			} );
		}
		if ( hoursAgo < 24 ) {
			return translate( '%(hours)dh ago', {
				args: { hours: hoursAgo },
				comment: 'example for a resulting string: 5h ago',
			} );
		}
		if ( daysAgo < 7 ) {
			return translate( '%(days)dd ago', {
				args: { days: daysAgo },
				comment: 'example for a resulting string: 4d ago',
			} );
		}

		return formatDate( dateObj, localeSlug, { dateStyle: 'medium' } );
	}, [ date, localeSlug, now, translate ] );
}

export function SpaceFeedTimeSince( { date }: Props ) {
	const translate = useTranslate();
	const relativeDate = useRelativeTime( date );
	const dateObj = new Date( date );
	const fullDate = formatDate( dateObj, translate.localeSlug, {
		dateStyle: 'full',
		timeStyle: 'medium',
	} );

	return (
		<time dateTime={ date } title={ fullDate }>
			{ relativeDate }
		</time>
	);
}
