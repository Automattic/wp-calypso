import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useHumanDate } from 'calypso/lib/human-date';

function TimeSince( { className, date, dateFormat } ) {
	const moment = useLocalizedMoment();
	const fullDate = useMemo( () => moment( date ).format( 'llll' ), [ moment, date ] );
	const humanDate = useHumanDate( date, dateFormat );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
