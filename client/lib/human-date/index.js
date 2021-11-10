import { useTranslate } from 'i18n-calypso';
import { useReducer, useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { EVERY_TEN_SECONDS, useInterval } from 'calypso/lib/interval';
const MILLIS_IN_MINUTE = 60 * 1000;

function getHumanDateString( date, dateFormat, moment, translate ) {
	const now = moment();
	date = moment( date );

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
			args: {
				minutes: minutes,
			},
			comment: 'example for a resulting string: 2m ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 ) {
		const hours = now.diff( date, 'hours' );
		return translate( '%(hours)dh ago', {
			args: {
				hours: hours,
			},
			comment: 'example for a resulting string: 5h ago',
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 * 7 ) {
		const days = now.diff( date, 'days' );
		return translate( '%(days)dd ago', {
			args: {
				days: days,
			},
			comment: 'example for a resulting string: 4d ago',
		} );
	}

	return date.format( dateFormat );
}

export function useHumanDate( date, dateFormat, interval = EVERY_TEN_SECONDS ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const [ tick, doTick ] = useReducer( ( t ) => t + 1, 0 );

	useInterval( doTick, interval );

	return useMemo( () => {
		return getHumanDateString( date, dateFormat, moment, translate );
	}, [ tick, date, dateFormat, moment, translate ] );
}
