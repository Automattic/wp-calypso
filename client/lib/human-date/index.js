import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { EVERY_TEN_SECONDS, useInterval } from 'calypso/lib/interval';

const MILLIS_IN_MINUTE = 60 * 1000;

export function getHumanDateString( now, date, dateFormat, moment, translate ) {
	date = moment( date );
	now = moment( now );

	let millisAgo = now.diff( date );
	if ( millisAgo < 0 ) {
		millisAgo = 0;
	}

	if ( millisAgo < MILLIS_IN_MINUTE ) {
		return translate( 'just now' );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 ) {
		const minutes = Math.ceil( millisAgo / MILLIS_IN_MINUTE );
		return translate( '%(minutes)dm ago', {
			args: { minutes },
			comment: 'example for a resulting string: 2m ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 ) {
		const hours = now.diff( date, 'hours' );
		return translate( '%(hours)dh ago', {
			args: { hours },
			comment: 'example for a resulting string: 5h ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 * 7 ) {
		const days = now.diff( date, 'days' );
		return translate( '%(days)dd ago', {
			args: { days },
			comment: 'example for a resulting string: 4d ago',
		} );
	}

	return date.format( dateFormat );
}

export function useHumanDate( date, dateFormat, interval = EVERY_TEN_SECONDS ) {
	const moment = useLocalizedMoment();
	const [ now, setNow ] = useState( () => new Date() );
	const translate = useTranslate();

	useInterval( () => setNow( new Date() ), interval );

	return useMemo( () => {
		return getHumanDateString( now, date, dateFormat, moment, translate );
	}, [ now, date, dateFormat, moment, translate ] );
}
