import moment from 'moment';
import { useState, useEffect } from 'react';
import getHumanDate from 'calypso/lib/human-date';
import { useInterval, EVERY_TEN_SECONDS } from 'calypso/lib/interval';

function TimeSince( { className, date, dateFormat } ) {
	const [ humanDate, setHumanDate ] = useState( '' );
	const [ fullDate, setFullDate ] = useState( '' );

	function update( newDate ) {
		const newHumanDate = getHumanDate( newDate ?? date, dateFormat );
		const newFullDate = moment( newDate ?? date ).format( 'llll' );

		if ( newHumanDate !== humanDate ) {
			setHumanDate( newHumanDate );
		}

		if ( newFullDate !== fullDate ) {
			setFullDate( newFullDate );
		}
	}

	useInterval( update, EVERY_TEN_SECONDS );

	useEffect( () => {
		update( date );
	}, [ update, date ] );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
