import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useHumanDate } from 'calypso/lib/human-date';

/**
 * @typedef {Object}   TimeSinceProps
 * @property {string}  date       The timestamp to render
 * @property {string=} dateFormat Moment format string for the tooltip, default = 'll'
 * @property {string=} className  Forwarded to underlying <time> element
 */

/**
 * @param {TimeSinceProps} props
 */
function TimeSince( { className, date, dateFormat = 'll' } ) {
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
