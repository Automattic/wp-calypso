import { useState, useEffect, useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getHumanDate from 'calypso/lib/human-date';
import { useInterval, EVERY_TEN_SECONDS } from 'calypso/lib/interval';

function TimeSince( { className, date, dateFormat } ) {
	const [ humanDate, setHumanDate ] = useState( '' );
	const moment = useLocalizedMoment();
	const fullDate = useMemo( () => moment( date ).format( 'llll' ), [ moment, date ] );

	function update() {
		const newHumanDate = getHumanDate( date, dateFormat );

		if ( newHumanDate !== humanDate ) {
			setHumanDate( newHumanDate );
		}
	}

	useInterval( update, EVERY_TEN_SECONDS );

	useEffect( () => {
		update();
	}, [] );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
